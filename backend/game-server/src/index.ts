import { Server } from "socket.io";
import { createServer } from "http";
import { HanafudaIO } from "@interfaces/socket.interface";
import { ServiceContainer } from "@services/ServiceContainer";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const httpServer = createServer();
const io: HanafudaIO = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 20000,
  pingInterval: 10000,
});

// Initialize services
const services = new ServiceContainer(io);
services.initialize();

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log("Listening on port " + PORT));
