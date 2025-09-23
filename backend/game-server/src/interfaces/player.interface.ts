import { HanafudaCard } from "@core/Card";

export interface PlayerGameData {
  hand: HanafudaCard[];
  captured: HanafudaCard[];
  roundScores: number[];
  finalScore: number;
}

export interface PlayerRoundResult {
  playerId: string;
  username: string;
  capturedScore: number;
  comboScore: number;
  totalScore: number;
}

export type PlayerStatus = "in-lobby" | "in-room" | "in-game";
