import { Room } from "@core/Room";
import { Player } from "@core/Player";
import { HanafudaSocket, HanafudaIO } from "@interfaces/socket.interface";
import { ServiceContainer } from "./ServiceContainer";
import { RoomSettings } from "@interfaces/room.interface";

export class RoomService {
  private rooms: Map<string, Room> = new Map<string, Room>();

  constructor(private services: ServiceContainer) {}

  /**
   * Creates a new room with the given creator and roomName.
   * @param {Player} creator The player who creates the room.
   * @param {string} roomName The name of the room.
   * @return {Room} The room object.
   */
  createRoom(creator: Player, roomName: string, settings?: RoomSettings): Room {
    const room = new Room(roomName, creator, settings);
    this.rooms.set(room.getId(), room);
    this.services.lobbyService.addRoomToLobby(room);

    return room;
  }

  removeRoom(roomId: string): void {
    this.rooms.delete(roomId);
    this.services.lobbyService.removeRoomFromLobby(roomId);
  }

  getRoomById(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  removePlayerFromRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (room) room.removePlayer(playerId);
  }

  setupSocketHandlers(socket: HanafudaSocket) {
    socket.on("request-room-state", (data: { playerId: string; roomId: string }) => {
      this.handleRoomStateRequest(socket, data);
    });

    socket.on("leave-room", () => {
      this.handleLeaveRoom(socket);
    });

    socket.on("ready-change", (data: { isReady: boolean }) => {
      this.handleReadyChange(socket, data);
    });

    // socket.on("start-game", () => {
    //   this.handleStartGame(socket);
    // });
  }

  private handleRoomStateRequest(socket: HanafudaSocket, data: { playerId: string; roomId: string }) {
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
  }

  private handleLeaveRoom(socket: HanafudaSocket) {
    try {
      if (!socket.data.roomId) {
        socket.emit("leave-room-error", { error: "Player not in room" });
        return;
      }

      const room = this.getRoomById(socket.data.roomId);
      const player = this.services.playerService.getPlayerById(socket.data.playerId);

      if (!room || !player) {
        socket.emit("leave-room-error", { error: "Room or player not found" });
        return;
      }

      if (room.removePlayer(player.getId())) {
        this.services.lobbyService.addPlayerToLobby(player);

        // Update session
        if (socket.data.sessionToken) {
          this.services.sessionService.updateSessionRoom(socket.data.sessionToken, undefined);
        }

        socket.data.roomId = undefined;
        socket.leave(room.getId());

        // Notify room
        this.services.io.to(room.getId()).emit("player-left-room", { id: player.getId() });
        socket.emit("leave-room-success", { roomId: room.getId() });
      }
    } catch (error: any) {
      socket.emit("leave-room-error", { error: error.message });
    }
  }

  private handleReadyChange(socket: HanafudaSocket, data: { isReady: boolean }) {
    try {
      const player = this.services.playerService.getPlayerById(socket.data.playerId);
      if (!player || !player.getRoomId()) {
        socket.emit("ready-change-error", { error: "Player not in room" });
        return;
      }

      player.setIsReady(data.isReady);

      // Update session
      if (socket.data.sessionToken) {
        this.services.sessionService.updateSessionReadyStatus(socket.data.sessionToken, data.isReady);
      }

      // Notify room
      this.services.io.to(player.getRoomId() ?? "").emit("player-ready-changed", {
        playerId: player.getId(),
        isReady: data.isReady,
      });

      socket.emit("ready-change-success", { isReady: data.isReady, playerId: player.getId() });
    } catch (error: any) {
      socket.emit("ready-change-error", { error: error.message });
    }
  }

  private handleStartGame(socket: HanafudaSocket) {
    try {
      if (!socket.data.roomId) {
        socket.emit("start-game-error", { error: "Player not in room" });
        return;
      }

      const room = this.getRoomById(socket.data.roomId);
      const player = this.services.playerService.getPlayerById(socket.data.playerId);

      if (!room || !player) {
        socket.emit("start-game-error", { error: "Room or player not found" });
        return;
      }

      // Check if player is room creator
      if (room.getCreatorId() !== player.getId()) {
        socket.emit("start-game-error", { error: "Only room creator can start the game" });
        return;
      }

      // Check if all players are ready
      const allPlayersReady = room.getPlayers().every((p) => p.getIsReady());
      if (!allPlayersReady) {
        socket.emit("start-game-error", { error: "All players must be ready to start" });
        return;
      }

      // Start game through game service
      const game = this.services.gameService.createGame(room.getId(), room.getPlayers());

      // Notify room
      this.services.io.to(room.getId()).emit("game-started", {
        gameId: game.getId(),
      });
    } catch (error: any) {
      socket.emit("start-game-error", { error: error.message });
    }
  }

  // handlePlayerReconnection(socket: HanafudaSocket, roomId: string) {
  //   socket.join(roomId);
  //   this.services.io.to(roomId).emit("player-reconnected", {
  //     playerId: socket.data.playerId,
  //     username: socket.data.username,
  //   });
  // }

  // Helper methods
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoomByPlayerId(playerId: string): Room | undefined {
    return Array.from(this.rooms.values()).find((room) =>
      room.getPlayers().some((player) => player.getId() === playerId)
    );
  }
}
