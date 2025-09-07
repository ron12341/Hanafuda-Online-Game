// import { Player } from "./Player";
// import { Room } from "./Room";

// export class Lobby {
//   public rooms: Room[] = [];
//   public waitingPlayers: Player[] = [];

//   constructor() {
//     console.log("lobby created");
//   }

//   addRoom(room: Room): void {
//     this.rooms.push(room);
//     this.cleanRooms();
//   }

//   removeRoom(roomId: string): void {
//     this.rooms = this.rooms.filter((room) => room.getId() !== roomId);
//     this.cleanRooms();
//   }

//   addPlayer(player: Player): void {
//     if (!this.waitingPlayers.includes(player)) this.waitingPlayers.push(player);
//   }

//   removePlayer(playerId: string): void {
//     this.waitingPlayers = this.waitingPlayers.filter((player) => player.getId() !== playerId);
//   }

//   // Getters
//   getRoom(roomId: string): Room | undefined {
//     return this.rooms.find((room) => room.getId() === roomId);
//   }

//   getWaitingPlayers(): Player[] {
//     return this.waitingPlayers;
//   }

//   getRooms(): Room[] {
//     return this.rooms;
//   }

//   // Private

//   private cleanRooms(): void {
//     this.rooms = this.rooms.filter(
//       (room) => room.getPlayers().length > 0 || Date.now() - room.getCreatedAt().getTime() < 30 * 60 * 1000
//     );
//   }
// }
