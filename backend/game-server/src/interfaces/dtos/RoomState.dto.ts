import { RoomSettings } from "../room.interface";

export interface RoomStateDTO {
  id: string;
  name: string;
  creatorId: string;
  players: PlayerDTO[];
  gameId?: string;
  settings: RoomSettings;
}

interface PlayerDTO {
  id: string;
  name: string;
  isReady: boolean;
}
