import { HanafudaIO, HanafudaSocket } from "@interfaces/socket.interface";
import { ServiceContainer } from "./ServiceContainer";

export class SocketManager {
  private connectionAttempts = new Map<string, number>();

  constructor(private io: HanafudaIO, private services: ServiceContainer) {}

  public initialize() {
    this.io.on("connection", (socket: HanafudaSocket) => {
      // Limit connection attempts
      this.limitConnectionAttempts(socket);

      const username = socket.handshake.query.username as string;
      const sessionToken = socket.handshake.query.sessionToken as string;

      // Authentication check
      if (!username) {
        this.handleConnectionError(socket, "Username is required");
        return;
      }

      // Handle reconnection or new connection through SessionService
      if (sessionToken && this.services.sessionService.hasSession(sessionToken)) {
        console.log("Reconnecting player: ", username);
        this.services.sessionService.handleReconnection(socket, sessionToken);
      } else {
        console.log("New player: ", username);
        this.services.sessionService.handleNewConnection(socket, username);
      }

      // Setup event handlers from services
      this.setupServiceHandlers(socket);
    });
  }

  private setupServiceHandlers(socket: HanafudaSocket) {
    // Setup handlers from each service
    this.services.lobbyService.setupSocketHandlers(socket);
    this.services.roomService.setupSocketHandlers(socket);
    this.services.gameService.setupSocketHandlers(socket);

    // Connection events (stay in SocketManager)
    socket.on("disconnect", reason => {
      this.handleDisconnect(socket, reason);
    });

    socket.on("error", error => {
      console.error(`Socket error (${socket.id}): ${error}`);
    });
  }

  private handleDisconnect(socket: HanafudaSocket, reason: string) {
    try {
      const sessionToken = socket.handshake.query.sessionToken as string;
      if (!sessionToken) return;

      // Delegate disconnection handling to SessionService
      this.services.sessionService.handleDisconnection(sessionToken);

      console.log(`Player disconnected: ${socket.data?.username || "unknown"} (${reason})`);
    } catch (error: any) {
      console.error("Disconnect handling failed: ", error.message);
    }
  }

  private handleConnectionError(socket: HanafudaSocket, error: string) {
    socket.emit("connection-error", {
      error: error,
      details: "Please provide a username to join the game.",
    });
    socket.disconnect();
  }

  private limitConnectionAttempts(socket: HanafudaSocket) {
    const ip = socket.handshake.address;
    const attempts = this.connectionAttempts.get(ip) || 0;

    if (attempts > 5) {
      socket.disconnect();
      return;
    }

    this.connectionAttempts.set(ip, attempts + 1);
    setTimeout(() => this.connectionAttempts.delete(ip), 60000);
  }
}
