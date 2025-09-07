import { RoomSettings } from "@interfaces/room.interface";

export interface LobbyStateDTO {
  rooms: RoomDTO[];
  waitingPlayers: PlayerDTO[]; // socketIds
}

interface RoomDTO {
  id: string;
  name: string;
  creatorId: string;
  players: string[]; // socketIds
  gameId?: string;
  settings: RoomSettings;
  status: "waiting" | "playing";
}

interface PlayerDTO {
  id: string;
  name: string;
}
