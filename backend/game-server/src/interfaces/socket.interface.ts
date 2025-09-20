import { Server, Socket } from "socket.io";
import { HanafudaCard } from "@core/Card";
import { PlayerRoundResult, PlayerStatus } from "./player.interface";
import { LobbyStateDTO } from "./dtos/LobbyState.dto";
import { PlayerStateDTO } from "./dtos/PlayerState.dto";
import { Player } from "@core/Player";
import { RoomSettings } from "./room.interface";
import { GameOverStateDTO, GameStateDTO, NextRoundStateDTO } from "./game.interface";
import { Game } from "@core/Game";

import { PlayerSession } from "./session.interface";
import { Room } from "@core/Room";

//
//  CLIENT TO SERVER EVENTS
//

export interface ClientToServerEvents {
  // // Connection & Authentication Events
  // "register-player": (username: string, callback: (response: { success: boolean; error?: string }) => void) => void;

  // Lobby Events
  "request-lobby-state": (callback: (state: LobbyStateDTO) => void) => void;
  "create-room": (
    data: {
      roomName: string;
      settings: RoomSettings;
    },
    callback: (response: { success: boolean; roomId?: string; error?: string }) => void
  ) => void;

  // Room Events
  "join-room": (data: { roomId: string }) => void;
  "leave-room": (data: { playerId: string; roomId: string }) => void;
  "ready-change": (data: { isReady: boolean }) => void;
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

  // Game Events
  "join-game": (gameId: string, callback: (success: boolean) => void) => void;
  "start-game": () => void;
  "request-game-state": (data: { gameId: string }) => void;
  "play-card": (data: { gameId: string; playerId: string; cardId: string; targetCardId?: string; action: string; cardType: string }) => void;

  // Stats Events
  stats: () => void;
}

//
//  SERVER TO CLIENT EVENTS
//

export interface ServerToClientEvents {
  // Connection Events
  connect: () => void;
  connect_error: (error: Error) => void;
  disconnect: (reason: string) => void;
  reconnect: (attempt: number) => void;
  reconnect_attempt: (attempt: number) => void;
  reconnect_failed: (error: Error) => void;
  "connection-error": (error: { error: string; details: string }) => void;

  // Session Events
  "session-created": (data: { sessionToken: string; playerId: string; username: string; isReady: boolean }) => void;
  "session-restored": (data: {
    sessionToken: string;
    playerId: string;
    username: string;
    isReady: boolean;
    roomId?: string;
    gameId?: string;
  }) => void;

  // Lobby Events
  "lobby-state": (state: LobbyStateDTO) => void;
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

  // Room Events
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
  "join-room-success": (data: { roomId: string }) => void;
  "join-room-error": (data: { error: string; roomId: string }) => void;
  "leave-room-success": (data: { roomId: string }) => void;
  "leave-room-error": (data: { error: string }) => void;
  "player-joined-room": (data: { id: string; name: string; isReady: boolean }) => void;
  "player-left-room": (data: { playerId: string; creatorId: string }) => void;
  "player-ready-changed": (data: { playerId: string; isReady: boolean }) => void;
  "ready-change-success": (data: { isReady: boolean; playerId: string }) => void;
  "ready-change-error": (data: { error: string }) => void;

  // Game Events
  "game-started": (data: { gameId: string }) => void;
  "start-game-error": (data: { error: string }) => void;
  "game-state": (data: { state: GameStateDTO }) => void;

  // Card Play Events
  "play-card-error": (data: { error: string }) => void;
  "play-card-success": (data: { success: boolean }) => void;
  "player-played-card": (data: {
    playerId: string;
    handCard: HanafudaCard;
    targetCard?: HanafudaCard;
    flippedCard: HanafudaCard;
    action: string;
  }) => void;
  "player-played-flipped-card": (data: { playerId: string; action: string; targetCardId?: string; currentTurnIndex: number }) => void;

  // Round & Game Progress Events
  "round-transition": (data: { roundResult: PlayerRoundResult[]; nextRound: NextRoundStateDTO }) => void;
  "game-over": (data: GameOverStateDTO) => void;

  // Player Events
  "player-reconnected": (data: { playerId: string; username: string }) => void;

  // Ping Events
  pong: () => void;

  // Test Events
  calledWith: (data: { message: string }) => void;

  // Stats Events
  stats: (data: { activeSessions: Array<PlayerSession>; activeRooms: Array<Room>; activeGames: Array<Game>; activePlayers: Array<Player> }) => void;
}

//
//  INTER SERVER EVENTS
//

export interface InterServerEvents {
  ping: () => void;
}

//
//  SOCKET DATA
//

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
