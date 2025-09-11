import { HanafudaCard } from "@core/Card";

export interface PlayerGameData {
  hand: HanafudaCard[];
  captured: HanafudaCard[];
  roundScores: number[];
}

export type PlayerStatus = "in-lobby" | "in-room" | "in-game";
