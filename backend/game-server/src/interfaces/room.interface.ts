export interface RoomSettings {
  maxPlayers: number;
  totalRounds: number;
  visibility: "public" | "private";
  minPlayers?: number;
}
