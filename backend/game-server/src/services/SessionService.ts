import { HanafudaSocket } from "@interfaces/socket.interface";
import { PlayerSession } from "../interfaces/session.interface";
import { ServiceContainer } from "./ServiceContainer";

export class SessionService {
  private sessions: Map<string, PlayerSession> = new Map<string, PlayerSession>();
  private sessionTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(private services: ServiceContainer) {}

  // Session management methods
  updateSession(sessionToken: string, updates: Partial<PlayerSession>) {
    const session = this.sessions.get(sessionToken);
    if (session) {
      this.sessions.set(sessionToken, { ...session, ...updates });
      return true;
    }
    return false;
  }

  getSession(sessionToken: string) {
    return this.sessions.get(sessionToken);
  }

  removeSession(sessionToken: string) {
    this.sessions.delete(sessionToken);
  }

  addSession(sessionToken: string, session: PlayerSession) {
    this.sessions.set(sessionToken, session);
  }

  hasSession(sessionToken: string) {
    return this.sessions.has(sessionToken);
  }

  generateSessionToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Connection handling methods (moved from SocketManager)
  handleNewConnection(socket: HanafudaSocket, username: string) {
    try {
      // Check if username is taken
      const existingPlayer = this.services.playerService.getPlayerByUsername(username);
      if (existingPlayer) {
        socket.emit("connection-error", {
          error: "Username already taken",
          details: "Please choose a different username.",
        });
        socket.disconnect();
        return;
      }

      // Create new player
      const player = this.services.playerService.createPlayer(socket.id, username);
      player.setConnectionStatus("connected");

      // Add to lobby
      this.services.lobbyService.addPlayerToLobby(player);

      // Generate session token
      const sessionToken = this.generateSessionToken();

      // Create session
      this.addSession(sessionToken, {
        playerId: player.getId(),
        username: player.getName(),
        socketId: socket.id,
        lastActive: Date.now(),
        isConnected: true,
        isReady: false,
      });

      // Set socket data
      socket.data = {
        playerId: player.getId(),
        username: player.getName(),
        status: player.getStatus(),
        sessionToken: sessionToken,
      };

      // Send session info to client
      socket.emit("session-created", {
        sessionToken: sessionToken,
        playerId: player.getId(),
        username: player.getName(),
        isReady: player.getIsReady(),
      });

      // Send initial lobby state
      socket.emit("lobby-state", this.services.lobbyService.getLobbyState());

      console.log(`New player registered: ${username} (${player.getId()})`);
    } catch (error: any) {
      console.error("Error handling new connection: ", error);
      socket.emit("connection-error", {
        error: "Connection failed",
        details: error.message,
      });
      socket.disconnect();
    }
  }

  handleReconnection(socket: HanafudaSocket, sessionToken: string) {
    try {
      const session = this.getSession(sessionToken);
      if (!session) throw new Error("Invalid session token");

      const player = this.services.playerService.getPlayerById(session.playerId);
      if (!player) throw new Error("Player not found");

      // Update player and session
      player.setConnectionStatus("connected");
      this.updateSession(sessionToken, {
        socketId: socket.id,
        lastActive: Date.now(),
        isConnected: true,
      });

      // Set socket data
      socket.data = {
        playerId: player.getId(),
        username: player.getName(),
        status: player.getStatus(),
        sessionToken: sessionToken,
        roomId: session.roomId,
        gameId: session.gameId,
      };

      // Rejoin rooms if needed
      if (session.roomId) {
        socket.join(session.roomId);
        socket.to(session.roomId).emit("player-reconnected", {
          playerId: player.getId(),
          username: player.getName(),
        });
      }

      // Send restored state
      socket.emit("session-restored", {
        sessionToken: sessionToken,
        playerId: player.getId(),
        username: player.getName(),
        roomId: session.roomId,
        gameId: session.gameId,
        isReady: player.getIsReady(),
      });

      socket.emit("lobby-state", this.services.lobbyService.getLobbyState());

      console.log(`Player reconnected: ${player.getName()} (${player.getId()})`);
    } catch (error: any) {
      console.error("Reconnection failed: ", error.message);
      socket.emit("connection-error", {
        error: "Reconnection failed",
        details: "Could not restore your session. Please refresh the page.",
      });
      socket.disconnect();
    }
  }

  handleDisconnection(sessionToken: string) {
    const session = this.getSession(sessionToken);
    if (!session) return;

    session.isConnected = false;
    session.lastActive = Date.now();

    // Schedule cleanup
    this.clearSessionTimeout(sessionToken);
    const timeout = setTimeout(() => {
      this.cleanupExpiredSession(sessionToken);
    }, 30000);

    this.sessionTimeouts.set(sessionToken, timeout);
  }

  // Utility methods
  private cleanupExpiredSession(sessionToken: string) {
    const session = this.getSession(sessionToken);
    if (!session || session.isConnected) return;

    console.log(`Cleaning up expired session for: ${session.username}`);

    // Remove from services
    this.services.playerService.removePlayerById(session.playerId);
    this.services.lobbyService.removePlayerFromLobby(session.playerId);

    if (session.roomId) {
      this.services.roomService.removePlayerFromRoom(session.roomId, session.playerId);
    }

    // Remove session
    this.sessions.delete(sessionToken);
    this.sessionTimeouts.delete(sessionToken);
  }

  clearSessionTimeout(sessionToken: string) {
    const timeout = this.sessionTimeouts.get(sessionToken);
    if (timeout) {
      clearTimeout(timeout);
      this.sessionTimeouts.delete(sessionToken);
    }
  }

  // Helper method to update room ID in session
  updateSessionRoom(sessionToken: string, roomId: string | undefined) {
    this.updateSession(sessionToken, { roomId });
  }

  // Helper method to update ready status in session
  updateSessionReadyStatus(sessionToken: string, isReady: boolean) {
    this.updateSession(sessionToken, { isReady });
  }
}
