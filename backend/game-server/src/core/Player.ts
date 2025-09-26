import { PlayerGameStateDTO, PlayerStateDTO } from "@interfaces/dtos/PlayerState.dto";
import { PlayerGameData, PlayerRoundResult } from "@interfaces/player.interface";
import { HanafudaCard } from "./Card";

import { ComboCalculator } from "@utils/ComboCalculator";

export class Player {
  private socketId: string;
  private id: string;
  private name: string;
  private status: "in-lobby" | "in-room" | "in-game";
  private isReady: boolean;
  private roomId?: string;
  private gameId?: string;
  private connectionStatus?: "connected" | "disconnected";

  private gameData?: PlayerGameData;

  constructor(socketId: string, name?: string) {
    this.id = socketId;
    this.name = name || "Anonymous";
    this.status = "in-lobby";
    this.isReady = false;
    this.connectionStatus = "connected";
    this.socketId = socketId;
  }

  initializeGameData(): void {
    this.gameData = {
      hand: [],
      captured: [],
      roundScores: [],
      finalScore: 0,
      gotWildCard: false,
    };
  }

  joinLobby(): void {
    this.status = "in-lobby";
    this.roomId = undefined;
    this.gameId = undefined;
    this.gameData = undefined;
  }

  joinRoom(roomId: string): void {
    this.roomId = roomId;
    this.status = "in-room";
  }

  joinGame(gameId: string): void {
    this.gameId = gameId;
    this.status = "in-game";
    this.initializeGameData();
  }

  clearGame(): void {
    this.gameId = undefined;
    this.gameData = undefined;
    this.status = "in-room";
  }

  clearRoom(): void {
    this.roomId = undefined;
    this.isReady = false;
    this.status = "in-lobby";
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getRoomId(): string | undefined {
    return this.roomId;
  }

  getGameId(): string | undefined {
    return this.gameId;
  }

  getStatus(): "in-lobby" | "in-room" | "in-game" {
    return this.status;
  }

  getIsReady(): boolean {
    return this.isReady;
  }

  getConnectionStatus(): "connected" | "disconnected" | undefined {
    return this.connectionStatus;
  }

  getGameData(): PlayerGameData | undefined {
    return this.gameData;
  }

  getHand(): HanafudaCard[] | undefined {
    return this.gameData?.hand;
  }

  setId(id: string): void {
    this.id = id;
  }

  setConnectionStatus(status: "connected" | "disconnected"): void {
    this.connectionStatus = status;
  }

  setRoomId(roomId: string): void {
    this.roomId = roomId;
  }

  setIsReady(isReady: boolean): void {
    this.isReady = isReady;
  }

  setGameId(gameId: string): void {
    this.gameId = gameId;
  }

  setGameData(gameData: PlayerGameData): void {
    this.gameData = gameData;
  }

  setHand(cards: HanafudaCard[]): void {
    this.gameData!.hand = cards;
  }

  playCard(card: HanafudaCard, targetCard: HanafudaCard): void {
    // remove the card from the player's hand
    this.gameData!.hand = this.gameData!.hand.filter(c => c.id !== card.id);

    // add the card to the table
    this.capture(card);
    this.capture(targetCard);
  }

  capture(card: HanafudaCard): void {
    this.gameData!.captured.push(card);
  }

  discard(card: HanafudaCard): void {
    this.gameData!.hand = this.gameData!.hand.filter(c => c.id !== card.id);
  }

  isHandEmpty(): boolean {
    if (!this.gameData) throw new Error("Player has no game data.");
    return this.gameData.hand.length === 0;
  }

  calculateRoundScore(limit: number): PlayerRoundResult {
    if (!this.gameData) throw new Error("Player has no game data.");

    let capturedScore = 0;
    for (const card of this.gameData.captured) {
      capturedScore += card.points;
    }
    capturedScore -= limit;

    const comboScore = ComboCalculator.calculateTotalScore(this.gameData.captured);
    const totalScore = capturedScore + comboScore;

    this.gameData.captured = [];
    this.gameData.roundScores.push(totalScore);
    this.gameData.finalScore += totalScore;

    return { playerId: this.id, username: this.name, capturedScore, comboScore, totalScore };
  }

  getState(): PlayerStateDTO {
    return {
      id: this.id,
      name: this.name,
      isReady: this.isReady,
      status: this.status,
      roomId: this.roomId,
      gameId: this.gameId,
    };
  }

  getGameState(): PlayerGameStateDTO {
    return {
      id: this.id,
      name: this.name,
      captured: this.gameData?.captured || [],
      roundScores: this.gameData?.roundScores || [],
    };
  }

  getSocketId(): string {
    return this.socketId;
  }

  setSocketId(socketId: string): void {
    this.socketId = socketId;
  }

  getUsername(): string {
    return this.name;
  }

  getFinalScore(): number {
    return this.gameData?.finalScore || 0;
  }

  gotWildCard(): boolean {
    return this.gameData?.gotWildCard || false;
  }

  setGotWildCard(gotWildCard: boolean): void {
    this.gameData!.gotWildCard = gotWildCard;
  }
}
