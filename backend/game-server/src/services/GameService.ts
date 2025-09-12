import { HanafudaIO, HanafudaSocket } from "@interfaces/socket.interface";
import { Game } from "@core/Game";
import { ServiceContainer } from "./ServiceContainer";
import { Player } from "@core/Player";
import { PlayCardResult, DiscardCardResult, PlayFlippedCardResult, DiscardFlippedCardResult } from "@interfaces/game.interface";

export class GameService {
  private games: Map<string, Game> = new Map<string, Game>();

  constructor(private services: ServiceContainer) {}

  setupSocketHandlers(socket: HanafudaSocket) {
    socket.on("request-game-state", (data: { gameId: string }) => {
      console.log("Requested game state: ", data.gameId);
      const game = this.getGameById(data.gameId);
      if (game) socket.emit("game-state", { state: game.getState(socket.data.playerId) });
    });

    socket.on("play-card", (data: { gameId: string; playerId: string; cardId: string; targetCardId?: string; action: string; cardType: string }) => {
      console.log("Play card: ", data);

      if (!data.gameId || !data.playerId || !data.cardId || !data.action || !data.cardType) {
        socket.emit("play-card-error", { error: "Missing required fields" });
        return;
      }

      if (data.action !== "capture" && data.action !== "discard") {
        socket.emit("play-card-error", { error: "Invalid action" });
        return;
      }

      if (data.cardType !== "hand" && data.cardType !== "flipped") {
        socket.emit("play-card-error", { error: "Invalid card type" });
        return;
      }

      if (data.action === "capture" && !data.targetCardId) {
        socket.emit("play-card-error", { error: "Missing target card id" });
        return;
      }

      try {
        const game = this.getGameById(data.gameId);

        if (!game) {
          socket.emit("play-card-error", { error: "Game not found" });
          return;
        }

        this.handleCardPlay(socket, game, data);

        socket.emit("play-card-success", { success: true });
      } catch (error: any) {
        socket.emit("play-card-error", { error: error.message });
      }
    });
  }

  createGame(roomId: string, players: Player[]): Game {
    const game = new Game(roomId, players);
    this.games.set(game.getId(), game);
    return game;
  }

  removeGame(gameId: string) {
    const game = this.games.get(gameId);

    if (!game) return;

    game.getPlayers().forEach(player => {
      player.clearGame();
    });

    const room = this.services.roomService.getRoomById(game.getRoomId());
    if (room) room.clearGame();

    this.games.delete(gameId);
  }

  getGameById(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  private handleCardPlay = (
    socket: HanafudaSocket,
    game: Game,
    data: { playerId: string; cardId: string; targetCardId?: string; action: string; cardType: string }
  ) => {
    try {
      let result: PlayCardResult | DiscardCardResult | PlayFlippedCardResult | DiscardFlippedCardResult;

      if (data.cardType === "hand") {
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
      } else if (data.cardType === "flipped") {
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
      }
    } catch (error: any) {
      console.error(error);
      socket.emit("play-card-error", { error: error.message });
    }
  };
}
