import { Player } from "@core/Player";

export class PlayerService {
  private players: Map<string, Player> = new Map<string, Player>();

  createPlayer(socketId: string, username: string): Player {
    const player = new Player(socketId, username);
    this.players.set(socketId, player);
    return player;
  }

  getPlayerById(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  removePlayerById(playerId: string): void {
    this.players.delete(playerId);
  }

  getPlayerByUsername(username: string): Player | undefined {
    return Array.from(this.players.values()).find((player) => player.getName() === username);
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }
}
