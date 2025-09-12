import { generateId } from "@utils/generateId";
import { HanafudaCard } from "./Card";
import { HanafudaDeck } from "./Deck";
import { Player } from "./Player";
import {
  DiscardCardResult,
  DiscardFlippedCardResult,
  GameRules,
  GameSettings,
  GameStateDTO,
  PlayCardResult,
  PlayFlippedCardResult,
  RoundResult,
} from "@interfaces/game.interface";
import { start } from "repl";

export class Game {
  private id: string;
  private roomId: string;
  private currentRound: number;
  private players: Player[] = [];

  // Essential Game State Properties
  private deck: HanafudaDeck = new HanafudaDeck();
  private table: HanafudaCard[] = [];
  private flippedCard: HanafudaCard | undefined;

  // Turn Management
  private currentTurnIndex: number;
  // private turnPhase: "draw" | "play" | "capture" | "scoring";

  // Game Rules & Configuration
  // private rules: GameRules;
  // private settings: GameSettings;

  // Timing
  // private startTime: Date;
  // private lastActionTime: Date;
  // private turnTimer?: NodeJS.Timeout;

  constructor(roomId: string, players: Player[]) {
    this.id = roomId; // use the same id as the roomId
    this.roomId = roomId;
    this.players = players;
    this.currentRound = 1;
    // this.rules = rules || getDefaultRules();
    // this.settings = this.rules.settings;

    // this.turnOrder = this.determineTurnOrder();
    this.currentTurnIndex = 0;

    this.startGame();
  }

  // Game Lifecycle Methods
  public startGame(): void {
    this.players.forEach(player => player.initializeGameData());

    this.initializeDeck();
    this.dealCards();
    this.startTurn();
  }

  // Card Management
  private initializeDeck(): void {
    this.deck = new HanafudaDeck();
    this.deck.shuffle();
  }

  private dealCards(): void {
    const cardsPerPlayer = 7;
    const tableCards = 6;

    this.players.forEach(player => player.setHand(this.deck.deal(cardsPerPlayer)));
    this.table = this.deck.deal(tableCards);
  }

  // Turn Management
  public startTurn(): void {
    const currentPlayer = this.getCurrentPlayer();
  }

  public nextTurn(): void {
    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
  }

  playCard(playerId: string, cardId: string, targetCardId: string): PlayCardResult {
    try {
      // Check if player is in game
      const player = this.players.find(player => player.getId() === playerId);
      if (!player) {
        throw new Error("Player not found in game.");
      }

      // Check if player has the card
      const handCard = player.getHand()!.find(card => card.id === cardId);
      if (!handCard) {
        throw new Error("Card not found in player's hand.");
      }

      // Check if target card is on the table
      const targetCard = this.table.find(card => card.id === targetCardId);
      if (!targetCard) {
        throw new Error("Target card not found on table.");
      }

      // check if valid move
      if (!handCard.matchesMonth(targetCard)) {
        throw new Error("Invalid card play.");
      }

      player.playCard(handCard, targetCard);
      this.table = this.table.filter(card => card.id !== targetCardId);
      this.flippedCard = this.deck.draw();

      return { handCard, targetCard, flippedCard: this.flippedCard! };
    } catch (error: any) {
      throw error;
    }
  }

  discardCard(playerId: string, cardId: string): DiscardCardResult {
    try {
      // Check if player is in game
      const player = this.players.find(player => player.getId() === playerId);
      if (!player) {
        throw new Error("Player not found in game.");
      }

      // Check if player has the card
      const handCard = player.getHand()!.find(card => card.id === cardId);
      if (!handCard) {
        throw new Error("Card not found in player's hand.");
      }

      player.discard(handCard);
      this.table.push(handCard);
      this.flippedCard = this.deck.draw();

      return { handCard, flippedCard: this.flippedCard! };
    } catch (error: any) {
      throw error;
    }
  }

  playFlippedCard(playerId: string, cardId: string, targetCardId: string): PlayFlippedCardResult {
    try {
      if (!this.flippedCard) {
        throw new Error("No flipped card. Wrong turn phase.");
      }

      const player = this.players.find(player => player.getId() === playerId);
      if (!player) {
        throw new Error("Player not found in game.");
      }

      // Check if player has the card
      if (cardId !== this.flippedCard!.id) {
        throw new Error("Invalid flipped card.");
      }

      // Check if target card is on the table
      const targetCard = this.table.find(card => card.id === targetCardId);
      if (!targetCard) {
        throw new Error("Target card not found on table.");
      }

      // check if valid move
      if (!this.flippedCard!.matchesMonth(targetCard)) {
        throw new Error("Invalid card play.");
      }

      // update player state
      player.capture(this.flippedCard!);
      player.capture(targetCard);

      // update game state
      this.table = this.table.filter(card => card.id !== targetCardId);
      this.flippedCard = undefined;
      this.nextTurn();

      return { targetCardId: targetCard.id, currentTurnIndex: this.currentTurnIndex };
    } catch (error: any) {
      throw error;
    }
  }

  discardFlippedCard = (playerId: string, cardId: string): DiscardFlippedCardResult => {
    try {
      if (!this.flippedCard) {
        throw new Error("No flipped card. Wrong turn phase.");
      }

      const player = this.players.find(player => player.getId() === playerId);
      if (!player) {
        throw new Error("Player not found in game.");
      }

      // Check if player has the card
      if (cardId !== this.flippedCard!.id) {
        throw new Error("Invalid flipped card.");
      }

      // update game state
      this.table.push(this.flippedCard!);
      this.flippedCard = undefined;
      this.nextTurn();

      return { currentTurnIndex: this.currentTurnIndex };
    } catch (error: any) {
      throw error;
    }
  };

  // Scoring Methods
  public calculateScores(): void {
    this.players.forEach(player => {
      // const yaku = this.identifyYaku(player.collectedCards);
      // const score = this.calculateYakuScore(yaku);
      // this.scores.set(player.id, (this.scores.get(player.getId()) || 0) + score);
    });
  }

  // Utility Methods
  public getCurrentPlayer(): Player {
    return this.players[this.currentTurnIndex];
  }

  public isPlayerTurn(playerId: string): boolean {
    return this.getCurrentPlayer().getId() === playerId;
  }

  public getState(forPlayerId: string): GameStateDTO {
    // Return sanitized game state for client
    return {
      id: this.id,
      roomId: this.roomId,
      currentRound: this.currentRound,
      currentTurnIndex: this.currentTurnIndex,
      players: this.players.map(player => player.getGameState()),
      table: this.table,
      myHand: this.players.find(player => player.getId() === forPlayerId)?.getHand() || [],
      flippedCard: this.flippedCard,
      deckSize: this.deck.getRemainingCount(),
    };
  }

  getId(): string {
    return this.id;
  }

  getRoomId(): string {
    return this.roomId;
  }

  getPlayers(): Player[] {
    return this.players;
  }

  getCurrentTurnIndex(): number {
    return this.currentTurnIndex;
  }
}
