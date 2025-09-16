import { HanafudaSocket } from "@interfaces/socket.interface";
import { Game } from "@core/Game";
import { ServiceContainer } from "./ServiceContainer";
import {
  PlayCardResult,
  DiscardCardResult,
  PlayFlippedCardResult,
  DiscardFlippedCardResult,
  GameOverStateDTO,
  RoundResult,
} from "@interfaces/game.interface";
import { PlayerRoundResult } from "@interfaces/player.interface";

export class GameService {
  private games: Map<string, Game> = new Map<string, Game>();

  constructor(private services: ServiceContainer) {}

  //
  //  PUBLIC METHODS
  //

  public setupSocketHandlers(socket: HanafudaSocket) {
    socket.on("request-game-state", this.handleGameStateRequest.bind(this, socket));
    socket.on("play-card", this.handlePlayCard.bind(this, socket));
  }

  public addGame(game: Game): void {
    this.games.set(game.getId(), game);
  }

  //
  //  PRIVATE METHODS
  //

  private removeGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    console.log(`Cleaning up game: ${gameId}`);

    try {
      this.cleanupGameReferences(game);
      this.games.delete(gameId);
      console.log(`Game ${gameId} removed successfully`);
    } catch (error) {
      console.error(`Error removing game ${gameId}:`, error);
      // Force removal even if cleanup fails
      this.games.delete(gameId);
    }
  }

  private getGameById(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  //
  //  SOCKET HANDLERS
  //

  private handleGameStateRequest(socket: HanafudaSocket, data: { gameId: string }) {
    console.log("Requested game state: ", data.gameId);
    const game = this.getGameById(data.gameId);
    if (game) socket.emit("game-state", { state: game.getState(socket.data.playerId) });
  }

  private handlePlayCard(
    socket: HanafudaSocket,
    data: {
      gameId: string;
      playerId: string;
      cardId: string;
      targetCardId?: string;
      action: string;
      cardType: string;
    }
  ) {
    console.log("Play card: ", data);

    if (!this.validatePlayCardData(data)) {
      socket.emit("play-card-error", { error: "Invalid request data" });
      return;
    }

    try {
      const game = this.getGameById(data.gameId);
      if (!game) {
        socket.emit("play-card-error", { error: "Game not found" });
        return;
      }

      this.processCardPlay(socket, game, data);
      socket.emit("play-card-success", { success: true });
    } catch (error: any) {
      socket.emit("play-card-error", { error: error.message });
    }
  }

  private processCardPlay(
    socket: HanafudaSocket,
    game: Game,
    data: { playerId: string; cardId: string; targetCardId?: string; action: string; cardType: string }
  ) {
    try {
      if (data.cardType === "hand") {
        this.processHandCardPlay(socket, game, data);
      } else if (data.cardType === "flipped") {
        this.processFlippedCardPlay(socket, game, data);
      }
    } catch (error: any) {
      console.error(error);
      socket.emit("play-card-error", { error: error.message });
    }
  }

  private processHandCardPlay(socket: HanafudaSocket, game: Game, data: { playerId: string; cardId: string; targetCardId?: string; action: string }) {
    let result: PlayCardResult | DiscardCardResult;

    if (data.action === "capture") {
      result = game.playCard(data.playerId, data.cardId, data.targetCardId!);
    } else {
      result = game.discardCard(data.playerId, data.cardId);
    }

    const broadcastData = {
      playerId: data.playerId,
      handCard: result.handCard,
      flippedCard: result.flippedCard,
      action: data.action,
      ...("targetCard" in result ? { targetCard: result.targetCard } : {}),
    };

    this.services.io.to(game.getRoomId()).emit("player-played-card", broadcastData);
  }

  private processFlippedCardPlay(
    socket: HanafudaSocket,
    game: Game,
    data: { playerId: string; cardId: string; targetCardId?: string; action: string }
  ) {
    let result: PlayFlippedCardResult | DiscardFlippedCardResult;

    if (data.action === "capture") {
      result = game.playFlippedCard(data.playerId, data.cardId, data.targetCardId!);
    } else {
      result = game.discardFlippedCard(data.playerId, data.cardId);
    }

    console.log("Result: ", result);

    const broadcastData = {
      playerId: data.playerId,
      action: data.action,
      currentTurnIndex: game.getCurrentTurnIndex(),
      ...("targetCardId" in result ? { targetCardId: result.targetCardId } : {}),
    };

    this.services.io.to(game.getRoomId()).emit("player-played-flipped-card", broadcastData);

    if (game.isRoundOver()) {
      this.handleRoundEnd(game);
    }
  }

  private handleRoundEnd(game: Game) {
    if (game.isGameOver()) {
      game.endRound();
      console.log("Game over");
      const gameOverData: GameOverStateDTO = game.getGameOverState();
      this.services.io.to(game.getRoomId()).emit("game-over", gameOverData);
      this.removeGame(game.getId());
      this.services.roomService.removeRoom(game.getRoomId());
    } else {
      const roundResult: PlayerRoundResult[] = game.endRound();
      console.log("Start next round");
      game.startNextRound();
      this.notifyPlayersRoundTransition(game, roundResult);
    }
  }

  private notifyPlayersRoundTransition(game: Game, roundResult: PlayerRoundResult[]) {
    game.getPlayers().forEach(player => {
      this.services.io.to(player.getSocketId()).emit("round-transition", {
        roundResult,
        nextRound: game.getNextRoundState(player.getId()),
      });
    });
  }

  private validatePlayCardData(data: any): boolean {
    if (!data.gameId || !data.playerId || !data.cardId || !data.action || !data.cardType) {
      return false;
    }

    if (data.action !== "capture" && data.action !== "discard") {
      return false;
    }

    if (data.cardType !== "hand" && data.cardType !== "flipped") {
      return false;
    }

    if (data.action === "capture" && !data.targetCardId) {
      return false;
    }

    return true;
  }

  private cleanupGameReferences(game: Game) {
    // Clean up player references
    game.getPlayers().forEach(player => {
      if (player) {
        player.clearGame();
      }
    });

    // Clean up room reference
    const room = this.services.roomService.getRoomById(game.getRoomId());
    if (room) {
      room.clearGame();
    }

    // Perform any game-specific cleanup
    if (typeof (game as any).cleanup === "function") {
      (game as any).cleanup();
    }
  }
}
