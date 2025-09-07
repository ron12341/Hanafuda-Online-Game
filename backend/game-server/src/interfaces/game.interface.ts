import { HanafudaCard } from "./card.interface";
import { PlayerGameData } from "./player.interface";

export interface GameState {
  rounds: Round[];
  players: PlayerGameData[];
  currentRound: number;
}

export interface Round {
  number: number;
  field: HanafudaCard[];
  deck: HanafudaCard[];
  currentPlayerId: string;
  moves: GameMove[];
  scores?: RoundScores;
}

export interface GameMove {
  type: "capture" | "discard" | "deck-draw";
  playerId: string;
  cards: HanafudaCard[]; // Cards involved in the move
  timestamp: Date;
}

interface RoundScores {
  [playerId: string]: number;
}
