import { HanafudaCard } from "@core/Card";
import { Player } from "@core/Player";
import { PlayerGameData, PlayerRoundResult } from "./player.interface";
import { PlayerGameStateDTO } from "./dtos/PlayerState.dto";

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
  totalRounds: number;
}

export interface RoundResult {
  roundNumber: number;
  scores: { [playerId: string]: number };
  winner?: string;
}

export interface RoundScore {
  round: number;
  roundScores: PlayerRoundResult[];
}

export interface GameStateDTO {
  id: string;
  roomId: string;
  currentRound: number;
  currentTurnIndex: number;
  players: PlayerGameStateDTO[];
  table: HanafudaCard[];
  myHand: HanafudaCard[];
  flippedCard: HanafudaCard | undefined;
  deckSize: number;
  gameScores: RoundScore[];
  settings: GameSettings;
}

export interface NextRoundStateDTO {
  table: HanafudaCard[];
  myHand: HanafudaCard[];
  currentTurnIndex: number;
  deckSize: number;
}

export interface GameOverStateDTO {
  finalScores: Array<{ username: string; score: number }> | undefined;
  winner: string;
}

export interface PlayCardResult {
  handCard: HanafudaCard;
  targetCard: HanafudaCard;
  flippedCard: HanafudaCard;
}

export interface DiscardCardResult {
  handCard: HanafudaCard;
  flippedCard: HanafudaCard;
}

export interface PlayFlippedCardResult {
  targetCardId: string;
  currentTurnIndex: number;
}

export interface DiscardFlippedCardResult {
  currentTurnIndex: number;
}
