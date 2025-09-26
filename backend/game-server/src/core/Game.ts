import { HanafudaCard } from "./Card";
import { HanafudaDeck } from "./Deck";
import { Player } from "./Player";
import {
  DiscardCardResult,
  DiscardFlippedCardResult,
  GameOverStateDTO,
  GameSettings,
  GameStateDTO,
  NextRoundStateDTO,
  PlayCardResult,
  PlayFlippedCardResult,
  RoundResult,
  RoundScore,
} from "@interfaces/game.interface";
import { PlayerRoundResult } from "@interfaces/player.interface";

export class Game {
  private id: string;
  private roomId: string;
  private currentRound: number;
  private players: Player[] = [];
  private gameScores: RoundScore[] = [];

  // Essential Game State Properties
  private deck: HanafudaDeck = new HanafudaDeck();
  private table: HanafudaCard[] = [];
  private flippedCard: HanafudaCard | undefined;

  // Turn Management
  private currentTurnIndex: number;

  // Game Settings
  private settings: GameSettings;

  // Active Game Flag
  private lastActivityTimestamp: number = Date.now();

  constructor(roomId: string, players: Player[], settings?: GameSettings) {
    this.id = roomId; // use the same id as the roomId
    this.roomId = roomId;
    this.players = players;
    this.currentRound = 1;
    this.flippedCard = undefined;
    this.currentTurnIndex = 0;
    this.gameScores = [];

    players.forEach(player => {
      player.setGameId(this.id);
      player.joinGame(this.id);
    });

    this.settings = {
      maxPlayers: settings?.maxPlayers || 4,
      minPlayers: settings?.minPlayers || 3,
      totalRounds: settings?.totalRounds || 3,
    };

    this.startGame();
  }

  //
  // PUBLIC METHODS
  //

  public getId(): string {
    return this.id;
  }

  public getRoomId(): string {
    return this.roomId;
  }

  public getPlayers(): Player[] {
    return this.players;
  }

  public getCurrentTurnIndex(): number {
    return this.currentTurnIndex;
  }

  //
  //  GAME MANAGEMENT
  //

  public startGame(): void {
    this.initializeDeck();
    this.dealCards();

    this.updateLastActivity();
  }

  public endRound(): PlayerRoundResult[] {
    // The remaining cards on the table goes to the player with the "wildcard"
    if (this.table.length > 0) {
      for (let player of this.players) {
        if (player.gotWildCard()) {
          this.table.forEach(card => player.capture(card));
          this.table = [];
          player.setGotWildCard(false);
          break;
        }
      }
    }

    // Calculate round scores
    let limit = 0;
    if (this.players.length === 3) limit = 88;
    else if (this.players.length === 4) limit = 66;
    const results = this.players.map(player => player.calculateRoundScore(limit));

    // Set next turn to the winner
    this.currentTurnIndex = this.players.findIndex(player => player.getId() === results[0].playerId);

    // add score to round scores
    this.gameScores.push({ round: this.currentRound, roundScores: results });

    return results;
  }

  public startNextRound(): void {
    this.currentRound += 1;
    this.initializeDeck();
    this.dealCards();
    this.updateLastActivity();
  }

  //
  //  CARD PLAY METHODS
  //

  public playCard(playerId: string, cardId: string, targetCardId: string): PlayCardResult {
    const player = this.validatePlayerInGame(playerId);
    const handCard = this.validatePlayerHasCard(player, cardId);
    const targetCard = this.validateCardOnTable(targetCardId);

    this.validatePlayerInTurn(playerId);
    this.validateCardMatch(handCard, targetCard);

    player.playCard(handCard, targetCard);
    this.removeCardFromTable(targetCardId);
    this.drawFlippedCard();

    this.updateLastActivity();

    if (cardId === "11-kasu") {
      player.setGotWildCard(true);
    }

    return { handCard, targetCard, flippedCard: this.flippedCard! };
  }

  public discardCard(playerId: string, cardId: string): DiscardCardResult {
    const player = this.validatePlayerInGame(playerId);
    const handCard = this.validatePlayerHasCard(player, cardId);

    this.validatePlayerInTurn(playerId);

    player.discard(handCard);
    this.addCardToTable(handCard);
    this.drawFlippedCard();

    this.updateLastActivity();

    if (cardId === "11-kasu") {
      player.setGotWildCard(true);
    }

    return { handCard, flippedCard: this.flippedCard! };
  }

  public playFlippedCard(playerId: string, cardId: string, targetCardId: string): PlayFlippedCardResult {
    this.validateFlippedCardExists();
    const player = this.validatePlayerInGame(playerId);
    this.validatePlayerInTurn(playerId);
    this.validateFlippedCardMatches(cardId);
    const targetCard = this.validateCardOnTable(targetCardId);

    this.validateCardMatch(this.flippedCard!, targetCard);

    player.capture(this.flippedCard!);
    player.capture(targetCard);

    this.removeCardFromTable(targetCardId);
    this.clearFlippedCard();
    this.nextTurn();

    this.updateLastActivity();

    if (cardId === "11-kasu") {
      player.setGotWildCard(true);
    }

    return { targetCardId: targetCard.id, currentTurnIndex: this.currentTurnIndex };
  }

  public discardFlippedCard(playerId: string, cardId: string): DiscardFlippedCardResult {
    this.validateFlippedCardExists();
    const player = this.validatePlayerInGame(playerId);
    this.validatePlayerInTurn(playerId);
    this.validateFlippedCardMatches(cardId);

    this.addCardToTable(this.flippedCard!);
    this.clearFlippedCard();
    this.nextTurn();

    this.updateLastActivity();

    if (cardId === "11-kasu") {
      player.setGotWildCard(true);
    }

    return { currentTurnIndex: this.currentTurnIndex };
  }

  // CHECKERS

  public isRoundOver(): boolean {
    return this.deck.isEmpty() && this.flippedCard === undefined;
  }

  public isGameOver(): boolean {
    if (!this.isRoundOver()) {
      throw new Error("Round is not over.");
    }
    return this.currentRound >= this.settings.totalRounds;
  }

  //  GETTERS

  public getCurrentPlayer(): Player {
    return this.players[this.currentTurnIndex];
  }

  public getState(forPlayerId: string): GameStateDTO {
    return {
      id: this.id,
      roomId: this.roomId,
      currentRound: this.currentRound,
      currentTurnIndex: this.currentTurnIndex,
      players: this.players.map(player => player.getGameState()),
      table: this.table,
      myHand: this.getPlayerHand(forPlayerId),
      flippedCard: this.flippedCard,
      deckSize: this.deck.getRemainingCount(),
      gameScores: this.gameScores,
      settings: this.settings,
    };
  }

  public getNextRoundState(forPlayerId: string): NextRoundStateDTO {
    return {
      table: this.table,
      myHand: this.getPlayerHand(forPlayerId),
      currentTurnIndex: this.currentTurnIndex,
      deckSize: this.deck.getRemainingCount(),
    };
  }

  public getGameOverState(): GameOverStateDTO {
    return {
      finalScores: this.players.map(player => ({
        username: player.getUsername(),
        score: player.getFinalScore(),
      })),
      winner: this.determineWinner(),
    };
  }

  public getLastActivityTimestamp(): number {
    return this.lastActivityTimestamp;
  }

  public removePlayer(playerId: string): void {
    this.players = this.players.filter(player => player.getId() !== playerId);
  }

  //
  //  PRIVATE METHODS
  //

  private getPlayerHand(playerId: string): HanafudaCard[] {
    return this.players.find(player => player.getId() === playerId)?.getHand() || [];
  }

  private determineWinner(): string {
    const winner = this.players.reduce((prev, current) => (prev.getFinalScore() > current.getFinalScore() ? prev : current));
    return winner.getUsername();
  }

  private removeCardFromTable(cardId: string): void {
    this.table = this.table.filter(card => card.id !== cardId);
  }

  private addCardToTable(card: HanafudaCard): void {
    this.table.push(card);
  }

  private drawFlippedCard(): void {
    this.flippedCard = this.deck.draw();
  }

  private clearFlippedCard(): void {
    this.flippedCard = undefined;
  }

  private nextTurn(): void {
    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
  }

  private updateLastActivity(): void {
    this.lastActivityTimestamp = Date.now();
  }

  //  CARD MANAGEMENT METHODS
  private initializeDeck(): void {
    this.deck = new HanafudaDeck();
    this.deck.shuffle();
  }

  private dealCards(): void {
    let cardsPerPlayer: number;
    let tableCards: number;

    if (this.players.length === 3) {
      cardsPerPlayer = 7;
      tableCards = 6;
    } else if (this.players.length === 4) {
      cardsPerPlayer = 6;
      tableCards = 8;
    } else {
      throw new Error("Unsupported number of players for dealing cards.");
    }

    this.players.forEach(player => player.setHand(this.deck.deal(cardsPerPlayer)));
    this.table = this.deck.deal(tableCards);
  }

  // VALIDATION METHODS
  private validatePlayerInGame(playerId: string): Player {
    const player = this.players.find(player => player.getId() === playerId);
    if (!player) {
      throw new Error("Player not found in game.");
    }
    return player;
  }

  private validatePlayerHasCard(player: Player, cardId: string): HanafudaCard {
    const card = player.getHand()!.find(card => card.id === cardId);
    if (!card) {
      throw new Error("Card not found in player's hand.");
    }
    return card;
  }

  private validateCardOnTable(cardId: string): HanafudaCard {
    const card = this.table.find(card => card.id === cardId);
    if (!card) {
      throw new Error("Target card not found on table.");
    }
    return card;
  }

  private validateCardMatch(card: HanafudaCard, targetCard: HanafudaCard): void {
    if (!card.matchesMonth(targetCard)) {
      throw new Error("Invalid card play.");
    }
  }

  private validateFlippedCardExists(): void {
    if (!this.flippedCard) {
      throw new Error("No flipped card. Wrong turn phase.");
    }
  }

  private validateFlippedCardMatches(cardId: string): void {
    if (cardId !== this.flippedCard!.id) {
      throw new Error("Invalid flipped card.");
    }
  }

  private validatePlayerInTurn(playerId: string): void {
    if (this.getCurrentPlayer().getId() !== playerId) {
      throw new Error("It is not your turn.");
    }
  }
}
