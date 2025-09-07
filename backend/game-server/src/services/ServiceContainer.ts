import { HanafudaIO } from "@interfaces/socket.interface";
import { PlayerService } from "./PlayerService";
import { LobbyService } from "./LobbyService";
import { RoomService } from "./RoomService";
import { GameService } from "./GameService";
import { SessionService } from "./SessionService";
import { SocketManager } from "./SocketManager";

export class ServiceContainer {
  readonly playerService: PlayerService;
  readonly lobbyService: LobbyService;
  readonly roomService: RoomService;
  readonly gameService: GameService;
  readonly sessionService: SessionService;
  readonly socketManager: SocketManager;
  io: HanafudaIO = {} as HanafudaIO;

  constructor(io: HanafudaIO) {
    this.playerService = new PlayerService();
    this.lobbyService = new LobbyService(io, this);
    this.roomService = new RoomService(this);
    this.gameService = new GameService(io);
    this.sessionService = new SessionService(this);
    this.socketManager = new SocketManager(io, this);
    this.io = io;
  }

  initialize() {
    this.socketManager.initialize();
  }
}
