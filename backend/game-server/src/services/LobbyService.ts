import { Player } from "@core/Player";
import { Room } from "@core/Room";
import { PlayerSession } from "@interfaces/session.interface";
import { HanafudaIO, HanafudaSocket } from "@interfaces/socket.interface";
import { LobbyStateDTO } from "@interfaces/dtos/LobbyState.dto";
import { ILobbyService } from "@interfaces/services.interface";
import { ServiceContainer } from "./ServiceContainer";
import { RoomSettings } from "@interfaces/room.interface";

export class LobbyService implements ILobbyService {
  private waitingPlayers: Player[] = [];
  private rooms: Room[] = [];
  private broadcastDebounce: NodeJS.Timeout | null = null;

  constructor(private io: HanafudaIO, private services: ServiceContainer) {}

  // Player management
  addPlayerToLobby(player: Player): void {
    this.waitingPlayers.push(player);
    this.broadcastLobbyState();
  }

  removePlayerFromLobby(playerId: string): void {
    this.waitingPlayers = this.waitingPlayers.filter((player) => player.getId() !== playerId);
    this.broadcastLobbyState();
  }

  // Room management
  addRoomToLobby(room: Room): void {
    this.rooms.push(room);
    this.broadcastLobbyState();
  }

  removeRoomFromLobby(roomId: string): void {
    this.rooms = this.rooms.filter((room) => room.getId() !== roomId);
    this.broadcastLobbyState();
  }

  // Getters
  getPlayerById(playerId: string): Player | undefined {
    return this.waitingPlayers.find((player) => player.getId() === playerId);
  }

  getRoomById(roomId: string): Room | undefined {
    return this.rooms.find((room) => room.getId() === roomId);
  }

  getLobbyState(): LobbyStateDTO {
    return {
      rooms: this.rooms.map((room) => ({
        id: room.getId(),
        name: room.getName(),
        creatorId: room.getCreatorId(),
        players: room.getPlayers().map((player) => player.getId()),
        gameId: room.getGameId(),
        settings: room.getSettings(),
        status: room.getStatus(),
      })),
      waitingPlayers: this.waitingPlayers.map((player) => ({
        id: player.getId(),
        name: player.getName(),
      })),
    };
  }

  // Socket handlers
  setupSocketHandlers(socket: HanafudaSocket) {
    socket.on("request-lobby-state", () => {
      this.handleLobbyStateRequest(socket);
    });

    socket.on("create-room", (data: { roomName: string; settings: RoomSettings }, callback: CallbackFunction) => {
      this.handleCreateRoom(socket, data, callback);
    });

    socket.on("join-room", (data: { roomId: string }) => {
      this.handleJoinRoom(socket, data);
    });
  }

  private handleLobbyStateRequest(socket: HanafudaSocket) {
    socket.emit("lobby-state", this.getLobbyState());
  }

  private handleCreateRoom(
    socket: HanafudaSocket,
    data: { roomName: string; settings: RoomSettings },
    callback: CallbackFunction
  ) {
    try {
      const { roomName, settings } = data;

      const player = this.services.playerService.getPlayerById(socket.data.playerId);
      if (!player) {
        callback({ success: false, error: "Player not found" });
        return;
      }

      const room = this.services.roomService.createRoom(player, roomName, settings);
      this.removePlayerFromLobby(player.getId());

      // Update session
      if (socket.data.sessionToken) {
        this.services.sessionService.updateSessionRoom(socket.data.sessionToken, room.getId());
      }

      socket.data.roomId = room.getId();
      socket.join(room.getId());

      callback({ success: true, roomId: room.getId() });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  }

  private handleJoinRoom(socket: HanafudaSocket, data: { roomId: string }) {
    try {
      const room = this.services.roomService.getRoomById(data.roomId);
      if (!room) {
        socket.emit("join-room-error", { error: "Room not found", roomId: data.roomId });
        return;
      }

      const player = this.services.playerService.getPlayerById(socket.data.playerId);
      if (!player) {
        socket.emit("join-room-error", { error: "Player not found", roomId: data.roomId });
        return;
      }

      if (!room.addPlayer(player)) {
        socket.emit("join-room-error", { error: "Room is full", roomId: data.roomId });
        return;
      }

      this.removePlayerFromLobby(player.getId());

      // Update session
      if (socket.data.sessionToken) {
        this.services.sessionService.updateSessionRoom(socket.data.sessionToken, room.getId());
      }

      socket.data.roomId = room.getId();
      socket.join(room.getId());

      // Notify room
      socket.to(room.getId()).emit("player-joined-room", {
        id: player.getId(),
        name: player.getName(),
        isReady: player.getIsReady(),
      });

      socket.emit("join-room-success", { roomId: room.getId() });
    } catch (error: any) {
      socket.emit("join-room-error", { error: error.message, roomId: data.roomId });
    }
  }

  // Utility methods
  private broadcastLobbyState(): void {
    if (this.broadcastDebounce) {
      clearTimeout(this.broadcastDebounce);
    }

    this.broadcastDebounce = setTimeout(() => {
      this.services.io.emit("lobby-state", this.getLobbyState());
    }, 50);
  }

  // Helper methods for other services
  getWaitingPlayers(): Player[] {
    return [...this.waitingPlayers];
  }

  getRooms(): Room[] {
    return [...this.rooms];
  }
}

// Callback type definition
interface CallbackFunction {
  (response: { success: boolean; roomId?: string; error?: string }): void;
}
