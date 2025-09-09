import { generateId } from "@utils/generateId";
import { HanafudaCard } from "./Card";
import { HanafudaDeck } from "./Deck";
import { Player } from "./Player";
import { GameRules, GameSettings, GameStateDTO, RoundResult } from "@interfaces/game.interface";

export class Game {
  private id: string;
  private roomId: string;
  private currentRound: number;
  private players: Player[] = [];

  // Essential Game State Properties
  private deck: HanafudaDeck = new HanafudaDeck();
  private table: HanafudaCard[] = [];
  private discardPile: HanafudaCard[] = [];

  // Turn Management
  private currentTurnIndex: number;
  // private turnPhase: "draw" | "play" | "capture" | "scoring";

  // Scoring & Rounds
  private scores: Map<string, number> = new Map(); // playerId -> total score
  private roundHistory: RoundResult[] = [];

  // Game Rules & Configuration
  // private rules: GameRules;
  // private settings: GameSettings;

  // Timing
  // private startTime: Date;
  // private lastActionTime: Date;
  // private turnTimer?: NodeJS.Timeout;

  // Yaku & Collections
  private temporaryCaptures: Map<string, HanafudaCard[]> = new Map();

  constructor(roomId: string, players: Player[]) {
    this.id = generateId(8);
    this.roomId = roomId;
    this.players = players;
    this.currentRound = 1;
    // this.rules = rules || getDefaultRules();
    // this.settings = this.rules.settings;

    // Initialize scores
    players.forEach((player) => {
      this.scores.set(player.getId(), 0);
      this.temporaryCaptures.set(player.getId(), []);
    });

    // this.turnOrder = this.determineTurnOrder();
    this.currentTurnIndex = 0;
  }

  // Game Lifecycle Methods
  public startGame(): void {
    this.initializeDeck();
    this.dealCards();
    this.startTurn();
  }

  // public endGame(): void {
  //   this.calculateFinalScores();
  // }

  // Card Management
  private initializeDeck(): void {
    this.deck = new HanafudaDeck();
    this.deck.shuffle();
  }

  private dealCards(): void {
    const cardsPerPlayer = 7;
    const tableCards = 6;

    this.players.forEach((player) => {
      player.setHand(this.deck.deal(cardsPerPlayer));
    });

    this.table = this.deck.deal(tableCards);
  }

  // Turn Management
  public startTurn(): void {
    const currentPlayer = this.getCurrentPlayer();
  }

  public nextTurn(): void {
    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
    this.startTurn();
  }

  // private startTurnTimer(): void {
  //   this.cleanupTimers();
  //   this.turnTimer = setTimeout(() => {
  //     this.handleTurnTimeout();
  //   }, this.settings.turnTimeLimit * 1000);
  // }

  // private cleanupTimers(): void {
  //   if (this.turnTimer) {
  //     clearTimeout(this.turnTimer);
  //     this.turnTimer = undefined;
  //   }
  // }

  // Player Actions
  // public drawCard(playerId: string): HanafudaCard | undefined {
  //   // if (!this.isPlayerTurn(playerId) || this.turnPhase !== "draw") {
  //   //   return null;
  //   // }

  //   if (this.deck.getRemainingCount() === 0) {
  //     this.endRound();
  //     return undefined;
  //   }

  //   const card = this.deck.draw();
  //   // this.turnPhase = "play";
  //   return card;
  // }

  public playCard(playerId: string, cardId: string, targetCardId: string): boolean {
    // Validate and execute card play
    const playerCard = this.deck.getCardById(cardId);
    const targetCard = this.table.find((card) => card.id === targetCardId);

    if (!playerCard || !targetCard) {
      return false;
    }

    if (!playerCard.matchesMonth(targetCard)) {
      return false;
    }

    return this.captureCards(playerId, playerCard, targetCard);
  }

  public captureCards(playerId: string, handCard: HanafudaCard, targetCard: HanafudaCard): boolean {
    if (!handCard.matchesMonth(targetCard)) {
      return false;
    }

    this.temporaryCaptures.get(playerId)?.push(handCard);
    return true;
  }

  // Scoring Methods
  public calculateScores(): void {
    this.players.forEach((player) => {
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

  public getGameState(forPlayerId?: string): GameStateDTO {
    // Return sanitized game state for client
    return {
      id: this.id,
      roomId: this.roomId,
      currentRound: this.currentRound,
      players: this.players.map((player) => player.getId()),
      table: this.table,
      currentTurnIndex: this.currentTurnIndex,
      scores: this.scores,
      roundHistory: this.roundHistory,
      temporaryCaptures: this.temporaryCaptures,
    };
  }

  // // Event Handlers
  // private handleTurnTimeout(): void {
  //   // Auto-play or penalize player
  //   this.nextTurn();
  // }

  // private endRound(): void {
  //   this.calculateScores();
  //   this.roundHistory.push(this.createRoundResult());

  //   if (this.isGameOver()) {
  //     this.endGame();
  //   } else {
  //     this.currentRound++;
  //     this.currentMonth = (this.currentMonth % 12) + 1;
  //     this.initializeDeck();
  //     this.dealCards();
  //     this.startTurn();
  //   }
  // }

  // private isGameOver(): boolean {
  //   const winningScore = this.settings.pointsToWin;
  //   return (
  //     Array.from(this.scores.values()).some((score) => score >= winningScore) ||
  //     this.currentRound >= this.settings.maxRounds
  //   );
  // }

  getId(): string {
    return this.id;
  }

  getRoomId(): string {
    return this.roomId;
  }

  getPlayers(): Player[] {
    return this.players;
  }
}
