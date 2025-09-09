import { HanafudaCard } from "@core/Card";
import { Player } from "@core/Player";

export interface GameRules {
  scoringSystem: "koi-koi" | "88" | "standard";
  pointsToWin: number;
  maxRounds: number;
  allowKoiKoi: boolean;
  turnTimeLimit: number; // seconds
  settings: GameSettings;
}

export interface GameSettings {
  maxPlayers: number;
  minPlayers: number;
  startingCards: number;
  tableCards: number;
}

export interface RoundResult {
  roundNumber: number;
  scores: { [playerId: string]: number };
  winner?: string;
}

export interface Yaku {
  name: string;
  points: number;
  cards: HanafudaCard[];
  description: string;
}

export interface GameStateDTO {
  id: string;
  roomId: string;
  currentRound: number;
  players: string[];
  table: HanafudaCard[];
  currentTurnIndex: number;
  scores: Map<string, number>;
  roundHistory: RoundResult[];
  temporaryCaptures: Map<string, HanafudaCard[]>;
}
