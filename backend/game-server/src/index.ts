import { Server } from "socket.io";
import { createServer } from "http";
import { HanafudaIO } from "@interfaces/socket.interface";

import { PlayerService } from "./services/PlayerService";
import { LobbyService } from "@services/LobbyService";
import { RoomService } from "@services/RoomService";
import { GameService } from "@services/GameService";
import { SocketManager } from "@services/SocketManager";
import { SessionService } from "@services/SessionService";
import { ServiceContainer } from "@services/ServiceContainer";

const httpServer = createServer();
const io: HanafudaIO = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Initialize services
const services = new ServiceContainer(io);
services.initialize();

httpServer.listen(3001, () => console.log("Listening on port 3001"));
