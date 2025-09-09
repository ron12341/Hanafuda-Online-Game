import { HanafudaIO, HanafudaSocket } from "@interfaces/socket.interface";
import { Game } from "@core/Game";
import { ServiceContainer } from "./ServiceContainer";
import { Player } from "@core/Player";

export class GameService {
  private games: Map<string, Game> = new Map<string, Game>();

  constructor(private services: ServiceContainer) {}

  setupSocketHandlers(socket: HanafudaSocket, io: HanafudaIO) {}

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
