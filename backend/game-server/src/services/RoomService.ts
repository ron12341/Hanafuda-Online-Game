import { Room } from "@core/Room";
import { Player } from "@core/Player";
import { HanafudaSocket } from "@interfaces/socket.interface";
import { ServiceContainer } from "./ServiceContainer";
import { RoomSettings } from "@interfaces/room.interface";

export class RoomService {
  private rooms: Map<string, Room> = new Map<string, Room>();

  constructor(private services: ServiceContainer) {
    this.intervalCleanup();
  }

  public setupSocketHandlers(socket: HanafudaSocket): void {
    socket.on("request-room-state", data => this.handleRoomStateRequest(socket, data));
    socket.on("leave-room", data => this.handleLeaveRoom(socket, data));
    socket.on("ready-change", data => this.handleReadyChange(socket, data));
    socket.on("start-game", () => this.handleStartGame(socket));
  }

  // Socket handlers

  private handleRoomStateRequest(socket: HanafudaSocket, data: { playerId: string; roomId: string }): void {
    const room = this.getRoomById(data.roomId);
    if (!room) {
      socket.emit("room-state-error", { error: "Room not found", roomId: data.roomId });
      return;
    }

    if (!room.hasPlayer(data.playerId)) {
      socket.emit("room-state-error", { error: "Player not in room", roomId: data.roomId });
      return;
    }

    socket.emit("room-state", room.getState());
    this.services.sessionService.updateSessionActivity(socket.data.sessionToken!);
  }

  private handleLeaveRoom(socket: HanafudaSocket, data: { playerId: string; roomId: string }): void {
    try {
      const { playerId, roomId } = data;

      // Validate parameters
      if (!roomId || !playerId) {
        socket.emit("leave-room-error", { error: "Missing roomId or playerId" });
        return;
      }

      // Security check: verify socket ownership
      if (socket.data.playerId !== playerId) {
        socket.emit("leave-room-error", { error: "Unauthorized operation" });
        return;
      }

      const room = this.getRoomById(roomId);
      const player = this.services.playerService.getPlayerById(playerId);

      if (!room || !player) {
        socket.emit("leave-room-error", { error: "Room or player not found" });
        return;
      }

      // Ensure player is actually in this room
      if (!room.hasPlayer(playerId)) {
        socket.emit("leave-room-error", { error: "Player not in specified room" });
        return;
      }

      this.removePlayerFromRoom(roomId, playerId);
      this.services.lobbyService.addPlayerToLobby(player);

      // Update socket data
      socket.data.roomId = undefined;
      socket.leave(roomId);

      // Notify remaining players in the room
      socket.to(roomId).emit("player-left-room", {
        playerId: playerId,
        creatorId: room.getCreatorId(),
      });

      socket.emit("leave-room-success", {
        roomId: roomId,
      });

      this.services.sessionService.updateSessionActivity(socket.data.sessionToken!);
    } catch (error: any) {
      console.error("Error in handleLeaveRoom:", error);
      socket.emit("leave-room-error", { error: "Internal server error" });
    }
  }

  private handleReadyChange(socket: HanafudaSocket, data: { isReady: boolean }): void {
    try {
      const player = this.services.playerService.getPlayerById(socket.data.playerId);
      if (!player || !player.getRoomId()) {
        socket.emit("ready-change-error", { error: "Player not in room" });
        return;
      }

      const roomId = player.getRoomId();
      if (!roomId) {
        socket.emit("ready-change-error", { error: "Player not in room" });
        return;
      }

      player.setIsReady(data.isReady);

      // Update session if exists
      if (socket.data.sessionToken) {
        this.services.sessionService.updateSessionReadyStatus(socket.data.sessionToken, data.isReady);
      }

      // Notify all players in the room
      this.services.io.to(roomId).emit("player-ready-changed", {
        playerId: player.getId(),
        isReady: data.isReady,
      });

      socket.emit("ready-change-success", { isReady: data.isReady, playerId: player.getId() });

      this.services.sessionService.updateSessionActivity(socket.data.sessionToken!);
    } catch (error: any) {
      console.error("Error in handleReadyChange:", error);
      socket.emit("ready-change-error", { error: "Internal server error" });
    }
  }

  private handleStartGame(socket: HanafudaSocket): void {
    try {
      if (!socket.data.roomId) {
        socket.emit("start-game-error", { error: "Player not in room" });
        console.log(socket.data);
        return;
      }

      const room = this.getRoomById(socket.data.roomId);
      const player = this.services.playerService.getPlayerById(socket.data.playerId);

      if (!room || !player) {
        socket.emit("start-game-error", { error: "Room or player not found" });
        return;
      }

      const newGame = room.startGame(player);
      this.services.gameService.addGame(newGame);

      // Notify all players in the room
      this.services.io.to(room.getId()).emit("game-started", {
        gameId: newGame.getId(),
      });

      this.services.sessionService.updateSessionActivity(socket.data.sessionToken!);
    } catch (error: any) {
      console.error("Error in handleStartGame:", error);
      socket.emit("start-game-error", { error: error.message });
    }
  }

  // Room management
  public createRoom(creator: Player, roomName: string, settings?: RoomSettings): Room {
    const room = new Room(roomName, creator, settings);
    this.rooms.set(room.getId(), room);
    return room;
  }

  public removeRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Return all players to lobby
    room.getPlayers().forEach(player => {
      player.clearRoom();
      this.services.lobbyService.addPlayerToLobby(player);
    });

    this.rooms.delete(roomId);
    this.services.lobbyService.removeRoomFromLobby(roomId);
  }

  public getRoomById(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public removePlayerFromRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.removePlayer(playerId);

      // If room becomes empty, remove it
      if (room.isEmpty()) {
        this.removeRoom(roomId);
      }
    }
  }

  //
  // HELPER METHODS
  //
  private intervalCleanup() {
    setInterval(() => {
      const now = Date.now();
      this.rooms.forEach((room, roomId) => {
        if (room.isEmpty()) {
          console.log(`Cleaning up empty room: ${roomId}`);
          this.removeRoom(roomId);
        }
      });
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  public getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }
}
