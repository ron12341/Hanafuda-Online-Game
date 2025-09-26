export class HanafudaCard {
  constructor(
    public readonly id: string,
    public readonly month: number,
    public readonly type: "hikari" | "tane" | "tan" | "kasu",
    public readonly name: string,
    public readonly image: string,
    public readonly points: number // public readonly isBright: boolean = false, // public readonly isAnimal: boolean = false, // public readonly isRibbon: boolean = false, // public readonly isJunk: boolean = false,
  ) // public readonly isRedRibbon: boolean = false,
  // public readonly isBlueRibbon: boolean = false,
  // public readonly isPoetryRibbon: boolean = false
  {}

  // Helper methods
  public matchesMonth(otherCard: HanafudaCard): boolean {
    return this.month === otherCard.month || this.id === "11-kasu" || otherCard.id === "11-kasu";
  }

  // public isSpecial(): boolean {
  //   return this.isBright || this.isAnimal || this.isRibbon;
  // }

  public toString(): string {
    return `${this.month}-${this.type}-${this.name}`;
  }
}
