// import { Player } from "@core/Player";
// import { Room } from "@core/Room";
// import { Game } from "@core/Game";
// import { LobbyStateDTO } from "@interfaces/dtos/LobbyState.dto";

// export interface ILobbyService {
//   addPlayerToLobby(player: Player): void;
//   removePlayerFromLobby(playerId: string): void;
//   addRoomToLobby(room: Room): void;
//   removeRoomFromLobby(roomId: string): void;
//   getLobbyState(): LobbyStateDTO;
//   // broadcastLobbyState(): void;
// }

// export interface IPlayerService {
//   createPlayer(socketId: string, username: string): Player;
//   getPlayer(playerId: string): Player | undefined;
//   getPlayerByUsername(username: string): Player | undefined;
//   removePlayer(playerId: string): void;
//   updatePlayerSocketId(oldSocketId: string, newSocketId: string): boolean;
// }

// export interface IRoomService {
//   createRoom(owner: Player, roomName: string): Room;
//   getRoom(roomId: string): Room | undefined;
//   removeRoom(roomId: string): void;
//   joinRoom(player: Player, roomId: string): boolean;
//   leaveRoom(playerId: string, roomId: string): void;
// }

// export interface IGameService {
//   createGame(roomId: string, players: Player[]): Game;
//   getGame(gameId: string): Game | undefined;
//   endGame(gameId: string): void;
// }
