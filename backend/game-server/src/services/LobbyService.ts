import { Player } from "@core/Player";
import { Room } from "@core/Room";
import { HanafudaSocket } from "@interfaces/socket.interface";
import { LobbyStateDTO } from "@interfaces/dtos/LobbyState.dto";
import { ServiceContainer } from "./ServiceContainer";
import { RoomSettings } from "@interfaces/room.interface";

// Callback type definition
interface CallbackFunction {
  (response: { success: boolean; roomId?: string; error?: string }): void;
}

export class LobbyService {
  private waitingPlayers: Player[] = [];
  private rooms: Room[] = [];
  private broadcastDebounce: NodeJS.Timeout | null = null;

  constructor(private services: ServiceContainer) {}

  // Player management
  addPlayerToLobby(player: Player): void {
    if (this.waitingPlayers.some(p => p.getId() === player.getId())) return;

    player.joinLobby();
    this.waitingPlayers.push(player);
    this.broadcastLobbyState();
  }

  removePlayerFromLobby(playerId: string): void {
    this.waitingPlayers = this.waitingPlayers.filter(player => player.getId() !== playerId);
    this.broadcastLobbyState();
  }

  // Room management
  addRoomToLobby(room: Room): void {
    this.rooms.push(room);
    this.broadcastLobbyState();
  }

  removeRoomFromLobby(roomId: string): void {
    this.rooms = this.rooms.filter(room => room.getId() !== roomId);
    this.broadcastLobbyState();
  }

  // Getters
  getPlayerById(playerId: string): Player | undefined {
    return this.waitingPlayers.find(player => player.getId() === playerId);
  }

  getRoomById(roomId: string): Room | undefined {
    return this.rooms.find(room => room.getId() === roomId);
  }

  getLobbyState(): LobbyStateDTO {
    return {
      rooms: this.rooms.map(room => ({
        id: room.getId(),
        name: room.getName(),
        creatorId: room.getCreatorId(),
        players: room.getPlayers().map(player => player.getId()),
        gameId: room.getGameId(),
        settings: room.getSettings(),
        status: room.getStatus(),
      })),
      waitingPlayers: this.waitingPlayers.map(player => ({
        id: player.getId(),
        name: player.getName(),
      })),
    };
  }

  // Socket handlers
  setupSocketHandlers(socket: HanafudaSocket): void {
    socket.on("request-lobby-state", () => this.handleLobbyStateRequest(socket));
    socket.on("create-room", (data, callback) => this.handleCreateRoom(socket, data, callback));
    socket.on("join-room", data => this.handleJoinRoom(socket, data));
  }

  private handleLobbyStateRequest(socket: HanafudaSocket): void {
    socket.emit("lobby-state", this.getLobbyState());
  }

  private handleCreateRoom(socket: HanafudaSocket, data: { roomName: string; settings: RoomSettings }, callback: CallbackFunction): void {
    try {
      const { roomName, settings } = data;
      const player = this.services.playerService.getPlayerById(socket.data.playerId);

      if (!player) {
        callback({ success: false, error: "Player not found" });
        return;
      }

      if (player.getRoomId()) {
        callback({ success: false, error: "Player is already in a room" });
        return;
      }

      const newRoom = this.services.roomService.createRoom(player, roomName, settings);
      this.addRoomToLobby(newRoom);
      this.removePlayerFromLobby(player.getId());

      socket.data.roomId = newRoom.getId();
      socket.join(newRoom.getId());

      callback({ success: true, roomId: newRoom.getId() });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  }

  private handleJoinRoom(socket: HanafudaSocket, data: { roomId: string }): void {
    try {
      console.log(`Join room attempt: player ${socket.data.playerId}, room ${data.roomId}`);

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

      // This will throw if validation fails
      room.addPlayer(player);
      this.removePlayerFromLobby(player.getId());

      socket.data.roomId = room.getId();
      socket.join(room.getId());

      // Notify other players in the room
      socket.to(room.getId()).emit("player-joined-room", {
        id: player.getId(),
        name: player.getName(),
        isReady: player.getIsReady(),
      });

      socket.emit("join-room-success", {
        roomId: room.getId(),
      });

      console.log(`Player ${player.getId()} (${player.getName()}) successfully joined room ${room.getId()}`);
    } catch (error: any) {
      console.error(`Error joining room: ${error.message}`, error);
      socket.emit("join-room-error", { error: error.message, roomId: data.roomId });
    }
  }

  // Utility methods
  private broadcastLobbyState(): void {
    if (this.broadcastDebounce) {
      clearTimeout(this.broadcastDebounce);
    }

    this.broadcastDebounce = setTimeout(() => {
      const lobbyState = this.getLobbyState();
      this.services.io.emit("lobby-state", lobbyState); // Broadcast to all connected clients
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
