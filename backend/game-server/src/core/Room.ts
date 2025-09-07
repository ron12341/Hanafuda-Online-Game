import { Player } from "./Player";
import { RoomSettings } from "@interfaces/room.interface";
import { generateId } from "@utils/generateId";

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
      maxPlayers: settings?.maxPlayers || 2,
      totalRounds: settings?.totalRounds || 3,
      visibility: settings?.visibility || "public",
      minPlayers: settings?.minPlayers || 3,
    };
    this.status = "waiting";
    this.createdAt = new Date();

    creator.joinRoom(this.id);
  }

  addPlayer(player: Player): boolean {
    // Validate input
    if (!player) {
      console.error("Cannot add null player");
      return false;
    }

    // Check if already in a room
    if (player.getRoomId()) {
      console.error(`Player ${player.getId()} is already in room ${player.getRoomId()}`);
      return false;
    }

    // Check if already in this room
    if (this.players.some((p) => p.getId() === player.getId())) {
      console.error(`Player ${player.getId()} is already in this room`);
      return false;
    }

    // Check room capacity
    if (this.players.length >= this.settings.maxPlayers) {
      console.error(`Room ${this.id} is full`);
      return false;
    }

    // Add player
    this.players.push(player);
    player.setRoomId(this.id);

    console.log(`Player ${player.getId()} joined room ${this.id}`);
    return true;
  }

  removePlayer(playerId: string): boolean {
    const index = this.players.findIndex((p) => p.getId() === playerId);
    if (index === -1) return false;

    const player = this.players[index];
    player.setRoomId("");
    player.setIsReady(false);
    this.players.splice(index, 1);

    console.log(`Player ${playerId} left room ${this.id}`);
    return true;
  }

  hasPlayer(playerId: string): boolean {
    return this.players.some((player) => player.getId() === playerId);
  }

  isFull(): boolean {
    return this.players.length >= this.settings.maxPlayers;
  }

  getState(): any {
    return {
      id: this.id,
      name: this.name,
      creatorId: this.creatorId,
      players: this.players.map((player) => {
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

  private canStart(): boolean {
    return this.players.every((player) => player.getIsReady() === true);
  }

  // Getters
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
}
