import { HanafudaCard } from "@core/Card";
import { COMBOS, ComboInterface } from "@constants/combos";

export class ComboCalculator {
  // Light combos (take the highest only)
  static getHighestLightCombo(cards: HanafudaCard[]): { name: string; points: number } | null {
    const lightCards = cards.filter(card => card.type === "hikari");
    const lightCardIds = lightCards.map(card => card.id);

    const hasRainman = lightCardIds.includes("11-hikari");
    const lightCount = lightCardIds.length;

    if (lightCount >= 5) {
      return { name: COMBOS.FIVE_LIGHTS.name, points: COMBOS.FIVE_LIGHTS.points };
    }
    if (lightCount >= 4) {
      return { name: COMBOS.FOUR_LIGHTS.name, points: COMBOS.FOUR_LIGHTS.points };
    }
    if (lightCount >= 3 && !hasRainman) {
      return { name: COMBOS.THREE_LIGHTS.name, points: COMBOS.THREE_LIGHTS.points };
    }

    return null;
  }

  // Ribbon combos (can have multiple)
  static hasBlueRibbons(cards: HanafudaCard[]): { name: string; points: number } | null {
    const hasAllBlueRibbons = COMBOS.BLUE_RIBBONS.cards.every(requiredCardId => cards.some(card => card.id === requiredCardId));

    return hasAllBlueRibbons
      ? {
          name: COMBOS.BLUE_RIBBONS.name,
          points: COMBOS.BLUE_RIBBONS.points,
        }
      : null;
  }

  static hasWrittenRibbons(cards: HanafudaCard[]): { name: string; points: number } | null {
    const hasAllWrittenRibbons = COMBOS.WRITTEN_RIBBONS.cards.every(requiredCardId => cards.some(card => card.id === requiredCardId));

    return hasAllWrittenRibbons
      ? {
          name: COMBOS.WRITTEN_RIBBONS.name,
          points: COMBOS.WRITTEN_RIBBONS.points,
        }
      : null;
  }

  static hasSevenRibbons(cards: HanafudaCard[]): { name: string; points: number } | null {
    const ribbonCount = cards.filter(card => COMBOS.SEVEN_RIBBONS.cards.includes(card.id)).length;

    return ribbonCount >= COMBOS.SEVEN_RIBBONS.requiredCount!
      ? {
          name: COMBOS.SEVEN_RIBBONS.name,
          points: COMBOS.SEVEN_RIBBONS.points,
        }
      : null;
  }

  // Monthly combos
  static hasAprilSet(cards: HanafudaCard[]): { name: string; points: number } | null {
    const hasAllAprilCards = COMBOS.APRIL_SET.cards.every(requiredCardId => cards.some(card => card.id === requiredCardId));

    return hasAllAprilCards
      ? {
          name: COMBOS.APRIL_SET.name,
          points: COMBOS.APRIL_SET.points,
        }
      : null;
  }

  static hasDecemberSet(cards: HanafudaCard[]): { name: string; points: number } | null {
    const hasAllDecemberCards = COMBOS.DECEMBER_SET.cards.every(requiredCardId => cards.some(card => card.id === requiredCardId));

    return hasAllDecemberCards
      ? {
          name: COMBOS.DECEMBER_SET.name,
          points: COMBOS.DECEMBER_SET.points,
        }
      : null;
  }

  // Main function to find all combos
  static findCombos(cards: HanafudaCard[]): { combo: { name: string; points: number } }[] {
    const foundCombos: { combo: { name: string; points: number } }[] = [];

    // Light combos (only take highest)
    const lightCombo = this.getHighestLightCombo(cards);
    if (lightCombo) {
      foundCombos.push({ combo: lightCombo });
    }

    // Ribbon combos (can have multiple)
    const blueRibbons = this.hasBlueRibbons(cards);
    if (blueRibbons) {
      foundCombos.push({ combo: blueRibbons });
    }

    const writtenRibbons = this.hasWrittenRibbons(cards);
    if (writtenRibbons) {
      foundCombos.push({ combo: writtenRibbons });
    }

    const sevenRibbons = this.hasSevenRibbons(cards);
    if (sevenRibbons) {
      foundCombos.push({ combo: sevenRibbons });
    }

    // Monthly combos
    const aprilSet = this.hasAprilSet(cards);
    if (aprilSet) {
      foundCombos.push({ combo: aprilSet });
    }

    const decemberSet = this.hasDecemberSet(cards);
    if (decemberSet) {
      foundCombos.push({ combo: decemberSet });
    }

    // Sort by points descending
    return foundCombos.sort((a, b) => b.combo.points - a.combo.points);
  }

  // Individual check functions (for specific combo queries)
  static isThereFiveLights(cards: HanafudaCard[]): boolean {
    const lightCards = cards.filter(card => card.type === "hikari");
    return lightCards.length >= 5;
  }

  static isThereFourLights(cards: HanafudaCard[]): boolean {
    const lightCards = cards.filter(card => card.type === "hikari");
    return lightCards.length >= 4;
  }

  static isThereThreeLights(cards: HanafudaCard[]): boolean {
    const lightCards = cards.filter(card => card.type === "hikari");
    const hasRainman = cards.some(card => card.id === "11-hikari");
    return lightCards.length >= 3 && !hasRainman;
  }

  static isThereBlueRibbons(playerCards: HanafudaCard[]): boolean {
    const playerCardsIds = playerCards.map(card => card.id);
    const combo = COMBOS.BLUE_RIBBONS;

    for (const card of combo.cards) {
      console.log(card);
      if (!playerCardsIds.includes(card)) return false;
    }

    return true;
  }

  static isThereWrittenRibbons(cards: HanafudaCard[]): boolean {
    return COMBOS.WRITTEN_RIBBONS.cards.every(requiredCardId => cards.some(card => card.id === requiredCardId));
  }

  static isThereSevenRibbons(cards: HanafudaCard[]): boolean {
    const ribbonCount = cards.filter(card => COMBOS.SEVEN_RIBBONS.cards.includes(card.id)).length;
    return ribbonCount >= COMBOS.SEVEN_RIBBONS.requiredCount!;
  }

  static isThereAprilSet(cards: HanafudaCard[]): boolean {
    return COMBOS.APRIL_SET.cards.every(requiredCardId => cards.some(card => card.id === requiredCardId));
  }

  static isThereDecemberSet(cards: HanafudaCard[]): boolean {
    return COMBOS.DECEMBER_SET.cards.every(requiredCardId => cards.some(card => card.id === requiredCardId));
  }

  // Calculate total score
  static calculateTotalScore(cards: HanafudaCard[]): number {
    const combos = this.findCombos(cards);
    return combos.reduce((total, combo) => total + combo.combo.points, 0);
  }

  // Get combo by ID
  static getComboById(comboId: string): ComboInterface | undefined {
    return Object.values(COMBOS).find(combo => combo.id === comboId);
  }

  // Check if player has a specific combo by ID
  static hasComboById(cards: HanafudaCard[], comboId: string): boolean {
    const combo: ComboInterface | undefined = this.getComboById(comboId);
    if (!combo) return false;

    if (combo.requiredCount) {
      const matchingCount = cards.filter(card => combo.cards.includes(card.id)).length;

      if (combo.exclude) {
        const hasExcluded = combo.exclude.some(excludedCard => cards.some(card => card.id === excludedCard));
        return matchingCount >= combo.requiredCount && !hasExcluded;
      }

      return matchingCount >= combo.requiredCount;
    }

    return combo.cards.every(requiredCardId => cards.some(card => card.id === requiredCardId));
  }
}
