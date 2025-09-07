import { PlayerStateDTO } from "@interfaces/dtos/PlayerState.dto";
import { PlayerGameData } from "@interfaces/player.interface";

export class Player {
  private id: string;
  private name: string;
  private status: "in-lobby" | "in-room" | "in-game";
  private isReady: boolean;
  private roomId?: string;
  private gameId?: string;
  private gameData?: PlayerGameData;
  private connectionStatus?: "connected" | "disconnected";

  constructor(socketId: string, name?: string) {
    this.id = socketId;
    this.name = name || "Anonymous";
    this.status = "in-lobby";
    this.isReady = false;
    this.connectionStatus = "connected";
  }

  moveTolobby(): void {
    this.status = "in-lobby";
    this.roomId = undefined;
    this.gameId = undefined;
    this.gameData = undefined;
  }

  joinRoom(roomId: string): void {
    this.roomId = roomId;
    this.status = "in-room";
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getRoomId(): string | undefined {
    return this.roomId;
  }

  getGameId(): string | undefined {
    return this.gameId;
  }

  getStatus(): "in-lobby" | "in-room" | "in-game" {
    return this.status;
  }

  getIsReady(): boolean {
    return this.isReady;
  }

  getConnectionStatus(): "connected" | "disconnected" | undefined {
    return this.connectionStatus;
  }

  getState(): PlayerStateDTO {
    return {
      id: this.id,
      name: this.name,
      isReady: this.isReady,
      status: this.status,
      roomId: this.roomId,
      gameId: this.gameId,
    };
  }

  setId(id: string): void {
    this.id = id;
  }

  setConnectionStatus(status: "connected" | "disconnected"): void {
    this.connectionStatus = status;
  }

  setRoomId(roomId: string): void {
    this.roomId = roomId;
  }

  setIsReady(isReady: boolean): void {
    this.isReady = isReady;
  }
}
