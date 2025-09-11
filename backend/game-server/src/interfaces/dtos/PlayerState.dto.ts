import { HanafudaCard } from "@core/Card";
import { PlayerGameData } from "@interfaces/player.interface";

export interface PlayerStateDTO {
  id: string;
  name: string;
  isReady: boolean;
  status: "in-lobby" | "in-room" | "in-game";
  roomId?: string;
  gameId?: string;
}

export interface PlayerGameStateDTO {
  id: string;
  name: string;
  captured: HanafudaCard[];
  roundScores: number[];
}
