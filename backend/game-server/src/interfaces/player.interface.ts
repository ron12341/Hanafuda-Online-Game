import { HanafudaCard } from "./card.interface";

export interface PlayerGameData {
  hand: HanafudaCard[];
  captured: HanafudaCard[];
  roundScores: number[];
  totalScore: number;
}

export type PlayerStatus = "in-lobby" | "in-room" | "in-game";
