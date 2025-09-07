import { HanafudaIO, HanafudaSocket } from "@interfaces/socket.interface";
import { Game } from "@core/Game";

export class GameService {
  private games: Map<string, Game> = new Map<string, Game>();

  constructor(private io: HanafudaIO) {}

  setupSocketHandlers(socket: HanafudaSocket, io: HanafudaIO) {}
}
