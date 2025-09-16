import { Player } from "./Player";
import { RoomSettings } from "@interfaces/room.interface";
import { generateId } from "@utils/generateId";
import { Game } from "./Game";
import { GameSettings } from "@interfaces/game.interface";

export class Room {
  private id: string;
  private name: string;
  private creatorId: string;
  private players: Player[];
  private gameId?: string;
  private settings: RoomSettings;
  private status: "waiting" | "playing";
  private createdAt: Date;

  constructor(roomName: string, creator: Player, settings?: RoomSettings) {
    console.log("Creating room with seetings", settings);
    this.id = generateId(8);
    this.name = roomName;
    this.creatorId = creator.getId();
    this.players = [creator];
    this.settings = {
      maxPlayers: settings?.maxPlayers || 4,
      totalRounds: settings?.totalRounds || 3,
      visibility: settings?.visibility || "public",
      minPlayers: settings?.minPlayers || 3,
    };
    this.status = "waiting";
    this.createdAt = new Date();

    creator.joinRoom(this.id);
  }

  addPlayer(player: Player): void {
    if (!player) throw new Error("Cannot add null player");
    if (player.getRoomId()) throw new Error(`Player ${player.getId()} is already in room ${player.getRoomId()}`);
    if (this.isFull()) throw new Error(`Room ${this.id} is full`);

    this.players.push(player);
    player.joinRoom(this.id);
  }

  removePlayer(playerId: string): boolean {
    const index = this.players.findIndex(p => p.getId() === playerId);
    if (index === -1) return false;

    const player = this.players[index];
    player.clearRoom();
    this.players.splice(index, 1);

    console.log(`Player ${playerId} left room ${this.id}`);
    return true;
  }

  public startGame(starter: Player): Game {
    if (this.status === "playing") throw new Error(`Room ${this.id} is already in a game`);
    if (!this.hasPlayer(starter.getId())) throw new Error(`Player ${starter.getId()} is not in room ${this.id}`);
    if (starter.getId() !== this.creatorId) throw new Error(`Only room creator can start the game`);
    if (!this.isEveryoneReady()) throw new Error(`Not all players are ready in room ${this.id}`);

    this.status = "playing";
    const gameSettings: GameSettings = {
      maxPlayers: this.settings.maxPlayers,
      totalRounds: this.settings.totalRounds,
      minPlayers: this.settings.minPlayers,
    };

    return new Game(this.id, this.players, gameSettings);
  }

  hasPlayer(playerId: string): boolean {
    return this.players.some(player => player.getId() === playerId);
  }

  private isEveryoneReady(): boolean {
    return this.players.every(player => player.getIsReady());
  }

  isFull(): boolean {
    return this.players.length >= this.settings.maxPlayers;
  }

  clearGame(): void {
    this.gameId = undefined;
    this.status = "waiting";
  }

  getState(): any {
    return {
      id: this.id,
      name: this.name,
      creatorId: this.creatorId,
      players: this.players.map(player => {
        return {
          id: player.getId(),
          name: player.getName(),
          isReady: player.getIsReady(),
        };
      }),
      settings: this.settings,
      status: this.status,
    };
  }

  isEmpty(): boolean {
    return this.players.length === 0;
  }

  transferCreator(newCreatorId: string): void {
    this.creatorId = newCreatorId;
  }

  // Getters and Setters
  getId(): string {
    return this.id;
  }

  getPlayers(): Player[] {
    return this.players;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getName(): string {
    return this.name;
  }

  getCreatorId(): string {
    return this.creatorId;
  }

  getSettings(): RoomSettings {
    return this.settings;
  }

  getStatus(): "waiting" | "playing" {
    return this.status;
  }

  getGameId(): string | undefined {
    return this.gameId;
  }

  setStatus(status: "waiting" | "playing"): void {
    this.status = status;
  }
}
