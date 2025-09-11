import { HanafudaIO, HanafudaSocket } from "@interfaces/socket.interface";
import { Game } from "@core/Game";
import { ServiceContainer } from "./ServiceContainer";
import { Player } from "@core/Player";

export class GameService {
  private games: Map<string, Game> = new Map<string, Game>();

  constructor(private services: ServiceContainer) {}

  setupSocketHandlers(socket: HanafudaSocket) {
    socket.on("request-game-state", (data: { gameId: string }) => {
      console.log("Requested game state: ", data.gameId);
      const game = this.getGameById(data.gameId);
      if (game) socket.emit("game-state", { state: game.getState(socket.data.playerId) });
    });

    socket.on("play-card", (data: { gameId: string; playerId: string; cardId: string; targetCardId: string }) => {
      console.log("Play card: ", data);

      if (!data.gameId || !data.playerId || !data.cardId || !data.targetCardId) {
        socket.emit("play-card-error", { error: "Missing required data" });
        return;
      }

      try {
        const game = this.getGameById(data.gameId);

        if (!game) {
          socket.emit("play-card-error", { error: "Game not found" });
          return;
        }

        const result = game.playCard(data.playerId, data.cardId, data.targetCardId);

        // notify current player the move was successful
        socket.emit("play-card-success", { success: true });

        // Broadcast the updated game state to all players in the game
        this.services.io.to(game.getId()).emit("player-played-card", {
          playerId: data.playerId,
          handCard: result.handCard,
          targetCard: result.targetCard,
        });
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

    game.getPlayers().forEach((player) => {
      player.clearGame();
    });

    const room = this.services.roomService.getRoomById(game.getRoomId());
    if (room) room.clearGame();

    this.games.delete(gameId);
  }

  getGameById(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }
}
