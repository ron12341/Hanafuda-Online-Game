import { Server, Socket } from "socket.io";
import { HanafudaCard } from "@core/Card";
import { PlayerStatus } from "./player.interface";
import { LobbyStateDTO } from "./dtos/LobbyState.dto";
import { PlayerStateDTO } from "./dtos/PlayerState.dto";
import { Player } from "@core/Player";
import { RoomSettings } from "./room.interface";
import { GameStateDTO } from "./game.interface";

export interface ClientToServerEvents {
  "join-game": (gameId: string, callback: (success: boolean) => void) => void;
  "create-room": (
    data: {
      roomName: string;
      settings: RoomSettings;
    },
    callback: (response: { success: boolean; roomId?: string; error?: string }) => void
  ) => void;
  "request-lobby-state": (callback: (state: LobbyStateDTO) => void) => void;
  "request-room-state": (
    data: {
      playerId: string;
      roomId: string;
    },
    callback: (response: {
      state?: {
        id: string;
        name: string;
        players: Array<{
          id: string;
          name: string;
          isReady: boolean;
        }>;
      };
      error?: string;
    }) => void
  ) => void;
  "join-room": (data: { roomId: string }) => void;
  "leave-room": () => void;
  "ready-change": (data: { isReady: boolean }) => void;
  "request-player-state": (player: Player) => void;
  "register-player": (username: string, callback: (response: { success: boolean; error?: string }) => void) => void;

  "request-game-state": (data: { gameId: string }) => void;
  "start-game": () => void;
  "play-card": (data: { gameId: string; playerId: string; cardId: string; targetCardId: string }) => void;
}

export interface ServerToClientEvents {
  // Connection & Session Events
  connect: () => void;
  connect_error: (error: Error) => void;
  disconnect: (reason: string) => void;
  reconnect: (attempt: number) => void;
  reconnect_attempt: (attempt: number) => void;
  reconnect_failed: (error: Error) => void;
  "session-created": (data: { sessionToken: string; playerId: string; username: string; isReady: boolean }) => void;
  "session-restored": (data: {
    sessionToken: string;
    playerId: string;
    username: string;
    isReady: boolean;
    roomId?: string;
    gameId?: string;
  }) => void;
  "connection-error": (error: { error: string; details: string }) => void;

  // Lobby & Room Events
  "lobby-state": (state: LobbyStateDTO) => void;
  "room-state": (state: {
    id: string;
    name: string;
    creatorId: string;
    players: Array<{
      id: string;
      name: string;
      isReady: boolean;
    }>;
  }) => void;
  "room-state-error": (data: { error: string; roomId: string; playerId?: string }) => void;
  "lobby-update-rooms": (
    rooms: Array<{
      id: string;
      name: string;
      creatorId: string;
      players: string[];
      gameId?: string;
      status: "waiting" | "playing";
    }>
  ) => void;
  "lobby-update-waiting-players": (players: Array<{ id: string; name: string }>) => void;
  "join-room-success": (data: { roomId: string }) => void;
  "join-room-error": (data: { error: string; roomId: string }) => void;
  "ready-change-success": (data: { isReady: boolean; playerId: string }) => void;
  "ready-change-error": (data: { error: string }) => void;
  "leave-room-success": (data: { roomId: string }) => void;
  "leave-room-error": (data: { error: string }) => void;
  "player-joined-room": (data: { id: string; name: string; isReady: boolean }) => void;
  "player-left-room": (data: { id: string }) => void;
  "player-ready-changed": (data: { playerId: string; isReady: boolean }) => void;
  "player-reconnected": (data: { playerId: string; username: string }) => void;

  "start-game-error": (data: { error: string }) => void;
  "game-started": (data: { gameId: string }) => void;
  "game-state": (data: { state: GameStateDTO }) => void;

  // Room Events
  "player-joined": (playerId: string) => void;
  "player-left": (playerId: string) => void;
  "invalid-move": (message: string) => void;
  "player-state": (player: PlayerStateDTO) => void;

  // In Game Events
  "play-card-error": (data: { error: string }) => void;
  "play-card-success": (data: { success: boolean }) => void;
  "player-played-card": (data: { playerId: string; handCard: HanafudaCard; targetCard: HanafudaCard }) => void;

  // Utility Events
  pong: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  playerId: string;
  gameId?: string;
  roomId?: string;
  username: string;
  status: PlayerStatus;
  sessionToken: string;
}

export type HanafudaSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type HanafudaIO = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
