import { HanafudaCard } from "./Card";

export class HanafudaDeck {
  private cards: HanafudaCard[] = [];

  constructor() {
    this.initializeDeck();
  }

  private initializeDeck(): void {
    this.cards = [];

    // January
    // this.cards.push(
    //   new HanafudaCard("1-hikari", 1, "hikari", "Crane with Sun", "/cards/1-hikari.png", 20, true, false, false, false, false, false, false)
    // );
    // this.cards.push(new HanafudaCard("1-tan", 1, "tan", "Poetry Ribbon", "/cards/1-tan.png", 5, false, false, true, false, false, false, true));
    // this.cards.push(
    //   new HanafudaCard("1-kasu-1", 1, "kasu", "Plain with Nightingale", "/cards/1-kasu-1.png", 1, false, true, false, true, false, false, false)
    // );
    // this.cards.push(new HanafudaCard("1-kasu-2", 1, "kasu", "Plain", "/cards/1-kasu-2.png", 1, false, false, false, true, false, false, false));
    this.cards.push(new HanafudaCard("1-hikari", 1, "hikari", "Crane with Sun", "/cards/1-hikari.png", 20));
    this.cards.push(new HanafudaCard("1-tan", 1, "tan", "Poetry Ribbon", "/cards/1-tan.png", 5));
    this.cards.push(new HanafudaCard("1-kasu-1", 1, "kasu", "Plain with Nightingale", "/cards/1-kasu-1.png", 1));
    this.cards.push(new HanafudaCard("1-kasu-2", 1, "kasu", "Plain", "/cards/1-kasu-2.png", 1));

    // February
    // this.cards.push(new HanafudaCard("2-tane", 2, "tane", "Bush Warbler", "/cards/2-tane.png", 10, false, true, false, false, false, false, false));
    // this.cards.push(new HanafudaCard("2-tan", 2, "tan", "Poetry Ribbon", "/cards/2-tan.png", 5, false, false, true, false, false, false, true));
    // this.cards.push(new HanafudaCard("2-kasu-1", 2, "kasu", "Plain", "/cards/2-kasu-1.png", 1, false, false, false, true, false, false, false));
    // this.cards.push(new HanafudaCard("2-kasu-2", 2, "kasu", "Plain", "/cards/2-kasu-2.png", 1, false, false, false, true, false, false, false));
    this.cards.push(new HanafudaCard("2-tane", 2, "tane", "Bush Warbler", "/cards/2-tane.png", 10));
    this.cards.push(new HanafudaCard("2-tan", 2, "tan", "Poetry Ribbon", "/cards/2-tan.png", 5));
    this.cards.push(new HanafudaCard("2-kasu-1", 2, "kasu", "Plain", "/cards/2-kasu-1.png", 1));
    this.cards.push(new HanafudaCard("2-kasu-2", 2, "kasu", "Plain", "/cards/2-kasu-2.png", 1));

    // March
    //   new HanafudaCard("3-hikari", 3, "hikari", "Curtain with Moon", "/cards/3-hikari.png", 20, true, false, false, false, false, false, false)
    // );
    // this.cards.push(new HanafudaCard("3-tan", 3, "tan", "Poetry Ribbon", "/cards/3-tan.png", 5, false, false, true, false, false, false, true));
    // this.cards.push(new HanafudaCard("3-kasu-1", 3, "kasu", "Plain", "/cards/3-kasu-1.png", 1, false, false, false, true, false, false, false));
    // this.cards.push(new HanafudaCard("3-kasu-2", 3, "kasu", "Plain", "/cards/3-kasu-2.png", 1, false, false, false, true, false, false, false));
    this.cards.push(new HanafudaCard("3-hikari", 3, "hikari", "Curtain with Moon", "/cards/3-hikari.png", 20));
    this.cards.push(new HanafudaCard("3-tan", 3, "tan", "Poetry Ribbon", "/cards/3-tan.png", 5));
    this.cards.push(new HanafudaCard("3-kasu-1", 3, "kasu", "Plain", "/cards/3-kasu-1.png", 1));
    this.cards.push(new HanafudaCard("3-kasu-2", 3, "kasu", "Plain", "/cards/3-kasu-2.png", 1));

    // April
    // this.cards.push(new HanafudaCard("4-tane", 4, "tane", "Cuckoo", "/cards/4-tane.png", 10, false, true, false, false, false, false, false));
    // this.cards.push(new HanafudaCard("4-tan", 4, "tan", "Red Ribbon", "/cards/4-tan.png", 5, false, false, true, false, true, false, false));
    // this.cards.push(new HanafudaCard("4-kasu-1", 4, "kasu", "Plain", "/cards/4-kasu-1.png", 1, false, false, false, true, false, false, false));
    // this.cards.push(new HanafudaCard("4-kasu-2", 4, "kasu", "Plain", "/cards/4-kasu-2.png", 1, false, false, false, true, false, false, false));
    this.cards.push(new HanafudaCard("4-tane", 4, "tane", "Cuckoo", "/cards/4-tane.png", 10));
    this.cards.push(new HanafudaCard("4-tan", 4, "tan", "Red Ribbon", "/cards/4-tan.png", 5));
    this.cards.push(new HanafudaCard("4-kasu-1", 4, "kasu", "Plain", "/cards/4-kasu-1.png", 1));
    this.cards.push(new HanafudaCard("4-kasu-2", 4, "kasu", "Plain", "/cards/4-kasu-2.png", 1));

    // May
    // this.cards.push(
    //   new HanafudaCard("5-tane", 5, "tane", "Eight-Plank Bridge", "/cards/5-tane.png", 10, false, true, false, false, false, false, false)
    // );
    // this.cards.push(new HanafudaCard("5-tan", 5, "tan", "Red Ribbon", "/cards/5-tan.png", 5, false, false, true, false, true, false, false));
    // this.cards.push(new HanafudaCard("5-kasu-1", 5, "kasu", "Plain", "/cards/5-kasu-1.png", 1, false, false, false, true, false, false, false));
    // this.cards.push(new HanafudaCard("5-kasu-2", 5, "kasu", "Plain", "/cards/5-kasu-2.png", 1, false, false, false, true, false, false, false));
    this.cards.push(new HanafudaCard("5-tane", 5, "tane", "Eight-Plank Bridge", "/cards/5-tane.png", 10));
    this.cards.push(new HanafudaCard("5-tan", 5, "tan", "Red Ribbon", "/cards/5-tan.png", 5));
    this.cards.push(new HanafudaCard("5-kasu-1", 5, "kasu", "Plain", "/cards/5-kasu-1.png", 1));
    this.cards.push(new HanafudaCard("5-kasu-2", 5, "kasu", "Plain", "/cards/5-kasu-2.png", 1));

    // June
    // this.cards.push(new HanafudaCard("6-tane", 6, "tane", "Butterflies", "/cards/6-tane.png", 10, false, true, false, false, false, false, false));
    // this.cards.push(new HanafudaCard("6-tan", 6, "tan", "Blue Ribbon", "/cards/6-tan.png", 5, false, false, true, false, false, true, false));
    // this.cards.push(new HanafudaCard("6-kasu-1", 6, "kasu", "Plain", "/cards/6-kasu-1.png", 1, false, false, false, true, false, false, false));
    // this.cards.push(new HanafudaCard("6-kasu-2", 6, "kasu", "Plain", "/cards/6-kasu-2.png", 1, false, false, false, true, false, false, false));
    this.cards.push(new HanafudaCard("6-tane", 6, "tane", "Butterflies", "/cards/6-tane.png", 10));
    this.cards.push(new HanafudaCard("6-tan", 6, "tan", "Blue Ribbon", "/cards/6-tan.png", 5));
    this.cards.push(new HanafudaCard("6-kasu-1", 6, "kasu", "Plain", "/cards/6-kasu-1.png", 1));
    this.cards.push(new HanafudaCard("6-kasu-2", 6, "kasu", "Plain", "/cards/6-kasu-2.png", 1));

    // July
    // this.cards.push(new HanafudaCard("7-tane", 7, "tane", "Boar", "/cards/7-tane.png", 10, false, true, false, false, false, false, false));
    // this.cards.push(new HanafudaCard("7-tan", 7, "tan", "Red Ribbon", "/cards/7-tan.png", 5, false, false, true, false, true, false, false));
    // this.cards.push(new HanafudaCard("7-kasu-1", 7, "kasu", "Plain", "/cards/7-kasu-1.png", 1, false, false, false, true, false, false, false));
    // this.cards.push(new HanafudaCard("7-kasu-2", 7, "kasu", "Plain", "/cards/7-kasu-2.png", 1, false, false, false, true, false, false, false));
    this.cards.push(new HanafudaCard("7-tane", 7, "tane", "Boar", "/cards/7-tane.png", 10));
    this.cards.push(new HanafudaCard("7-tan", 7, "tan", "Red Ribbon", "/cards/7-tan.png", 5));
    this.cards.push(new HanafudaCard("7-kasu-1", 7, "kasu", "Plain", "/cards/7-kasu-1.png", 1));
    this.cards.push(new HanafudaCard("7-kasu-2", 7, "kasu", "Plain", "/cards/7-kasu-2.png", 1));

    // August
    // this.cards.push(
    //   new HanafudaCard("8-hikari", 8, "hikari", "Full Moon with Geese", "/cards/8-hikari.png", 20, true, false, false, false, false, false, false)
    // );
    // this.cards.push(new HanafudaCard("8-tane", 8, "tane", "Geese", "/cards/8-tane.png", 10, false, true, false, false, false, false, false));
    // this.cards.push(new HanafudaCard("8-kasu-1", 8, "kasu", "Plain", "/cards/8-kasu-1.png", 1, false, false, false, true, false, false, false));
    // this.cards.push(new HanafudaCard("8-kasu-2", 8, "kasu", "Plain", "/cards/8-kasu-2.png", 1, false, false, false, true, false, false, false));

    this.cards.push(new HanafudaCard("8-hikari", 8, "hikari", "Full Moon with Geese", "/cards/8-hikari.png", 20));
    this.cards.push(new HanafudaCard("8-tane", 8, "tane", "Geese", "/cards/8-tane.png", 10));
    this.cards.push(new HanafudaCard("8-kasu-1", 8, "kasu", "Plain", "/cards/8-kasu-1.png", 1));
    this.cards.push(new HanafudaCard("8-kasu-2", 8, "kasu", "Plain", "/cards/8-kasu-2.png", 1));

    // September
    // this.cards.push(new HanafudaCard("9-tane", 9, "tane", "Sake Cup", "/cards/9-tane.png", 10, false, true, false, false, false, false, false));
    // this.cards.push(new HanafudaCard("9-tan", 9, "tan", "Blue Ribbon", "/cards/9-tan.png", 5, false, false, true, false, false, true, false));
    // this.cards.push(new HanafudaCard("9-kasu-1", 9, "kasu", "Plain", "/cards/9-kasu-1.png", 1, false, false, false, true, false, false, false));
    // this.cards.push(new HanafudaCard("9-kasu-2", 9, "kasu", "Plain", "/cards/9-kasu-2.png", 1, false, false, false, true, false, false, false));
    this.cards.push(new HanafudaCard("9-tane", 9, "tane", "Sake Cup", "/cards/9-tane.png", 10));
    this.cards.push(new HanafudaCard("9-tan", 9, "tan", "Blue Ribbon", "/cards/9-tan.png", 5));
    this.cards.push(new HanafudaCard("9-kasu-1", 9, "kasu", "Plain", "/cards/9-kasu-1.png", 1));
    this.cards.push(new HanafudaCard("9-kasu-2", 9, "kasu", "Plain", "/cards/9-kasu-2.png", 1));

    // October
    // this.cards.push(new HanafudaCard("10-tane", 10, "tane", "Deer", "/cards/10-tane.png", 10, false, true, false, false, false, false, false));
    // this.cards.push(new HanafudaCard("10-tan", 10, "tan", "Blue Ribbon", "/cards/10-tan.png", 5, false, false, true, false, false, true, false));
    // this.cards.push(new HanafudaCard("10-kasu-1", 10, "kasu", "Plain", "/cards/10-kasu-1.png", 1, false, false, false, true, false, false, false));
    // this.cards.push(new HanafudaCard("10-kasu-2", 10, "kasu", "Plain", "/cards/10-kasu-2.png", 1, false, false, false, true, false, false, false));
    this.cards.push(new HanafudaCard("10-tane", 10, "tane", "Deer", "/cards/10-tane.png", 10));
    this.cards.push(new HanafudaCard("10-tan", 10, "tan", "Blue Ribbon", "/cards/10-tan.png", 5));
    this.cards.push(new HanafudaCard("10-kasu-1", 10, "kasu", "Plain", "/cards/10-kasu-1.png", 1));
    this.cards.push(new HanafudaCard("10-kasu-2", 10, "kasu", "Plain", "/cards/10-kasu-2.png", 1));

    // November
    // this.cards.push(
    //   new HanafudaCard("11-hikari", 11, "hikari", "Rainman", "/cards/11-hikari.png", 20, true, false, false, false, false, false, false)
    // );
    // this.cards.push(new HanafudaCard("11-tan", 11, "tan", "Poetry Ribbon", "/cards/11-tan.png", 5, false, false, true, false, false, false, true));
    // this.cards.push(new HanafudaCard("11-tane", 11, "tane", "Swallow", "/cards/11-tane.png", 10, false, true, false, false, false, false, false));
    // this.cards.push(new HanafudaCard("11-kasu-1", 11, "kasu", "Lightning", "/cards/11-kasu.png", 1, false, false, false, true, false, false, false));
    this.cards.push(new HanafudaCard("11-hikari", 11, "hikari", "Rainman", "/cards/11-hikari.png", 20));
    this.cards.push(new HanafudaCard("11-tan", 11, "tan", "Poetry Ribbon", "/cards/11-tan.png", 5));
    this.cards.push(new HanafudaCard("11-tane", 11, "tane", "Swallow", "/cards/11-tane.png", 10));
    this.cards.push(new HanafudaCard("11-kasu", 11, "kasu", "Lightning", "/cards/11-kasu.png", 1));

    // December
    // this.cards.push(
    //   new HanafudaCard("12-hikari", 12, "hikari", "Phoenix", "/cards/12-hikari.png", 20, true, false, false, false, false, false, false)
    // );
    // this.cards.push(new HanafudaCard("12-kasu-1", 12, "kasu", "Plain", "/cards/12-kasu-1.png", 1, false, false, false, true, false, false, false));
    // this.cards.push(new HanafudaCard("12-kasu-2", 12, "kasu", "Plain", "/cards/12-kasu-2.png", 1, false, false, false, true, false, false, false));
    // this.cards.push(new HanafudaCard("12-kasu-3", 12, "kasu", "Plain", "/cards/12-kasu-3.png", 1, false, false, false, true, false, false, false));

    this.cards.push(new HanafudaCard("12-hikari", 12, "hikari", "Phoenix", "/cards/12-hikari.png", 20));
    this.cards.push(new HanafudaCard("12-kasu-1", 12, "kasu", "Plain", "/cards/12-kasu-1.png", 1));
    this.cards.push(new HanafudaCard("12-kasu-2", 12, "kasu", "Plain", "/cards/12-kasu-2.png", 1));
    this.cards.push(new HanafudaCard("12-kasu-3", 12, "kasu", "Plain", "/cards/12-kasu-3.png", 1));
  }

  public shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  public deal(numCards: number): HanafudaCard[] {
    const cards = this.cards.splice(0, numCards);
    while (this.cardsHaveThreeOrMoreOfSameMonth(cards)) {
      this.cards.push(...cards);
      this.shuffle();
      cards.splice(0, cards.length, ...this.cards.splice(0, numCards));
    }
    return cards;
  }

  public draw(): HanafudaCard | undefined {
    return this.cards.shift();
  }

  public getRemainingCount(): number {
    return this.cards.length;
  }

  public isEmpty(): boolean {
    return this.cards.length === 0;
  }

  public getCardsByMonth(month: number): HanafudaCard[] {
    return this.cards.filter(card => card.month === month);
  }

  public getCardById(id: string): HanafudaCard | undefined {
    return this.cards.find(card => card.id === id);
  }

  public getCards() {
    return this.cards;
  }

  // Static methods

  public static createFullDeck(): HanafudaDeck {
    const deck = new HanafudaDeck();
    deck.shuffle();
    return deck;
  }

  //
  //  PRIVATE METHODS
  //

  // Checks if the cards have three or more cards from the same month
  private cardsHaveThreeOrMoreOfSameMonth(cards: HanafudaCard[]): boolean {
    const monthCount: { [key: number]: number } = {};
    cards.forEach(card => {
      monthCount[card.month] = (monthCount[card.month] || 0) + 1;
    });
    return Object.values(monthCount).some(count => count >= 3);
  }
}
