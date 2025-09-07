import { generateId } from "@utils/generateId";

export class Game {
  private id: string;
  private roomId: string;
  private currentRound: number;

  constructor(roomId: string) {
    this.id = generateId(8);
    this.roomId = roomId;
    this.currentRound = 1;
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getCurrentRound(): number {
    return this.currentRound;
  }
}
