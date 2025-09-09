import { HanafudaCard } from "./Card";

export class HanafudaDeck {
  private cards: HanafudaCard[] = [];

  constructor() {
    this.initializeDeck();
  }

  private initializeDeck(): void {
    this.cards = [];

    // January
    this.cards.push(new HanafudaCard("1-hikari-1", 1, "hikari", "Crane with Sun", "/cards/1-hikari.png", 20, true));
    this.cards.push(
      new HanafudaCard(
        "1-tan-1",
        1,
        "tan",
        "Poetry Ribbon",
        "/cards/1-tan.png",
        5,
        false,
        false,
        true,
        false,
        false,
        false,
        true
      )
    );
    this.cards.push(
      new HanafudaCard("1-kasu-1", 1, "kasu", "Plain", "/cards/1-kasu-1.png", 1, false, false, false, true)
    );
    this.cards.push(
      new HanafudaCard("1-kasu-2", 1, "kasu", "Plain", "/cards/1-kasu-2.png", 1, false, false, false, true)
    );

    // February
    this.cards.push(new HanafudaCard("2-tane-1", 2, "tane", "Bush Warbler", "/cards/2-tane.png", 10, false, true));
    this.cards.push(
      new HanafudaCard(
        "2-tan-1",
        2,
        "tan",
        "Poetry Ribbon",
        "/cards/2-tan.png",
        5,
        false,
        false,
        true,
        false,
        false,
        false,
        true
      )
    );
    this.cards.push(
      new HanafudaCard("2-kasu-1", 2, "kasu", "Plain", "/cards/2-kasu-1.png", 1, false, false, false, true)
    );
    this.cards.push(
      new HanafudaCard("2-kasu-2", 2, "kasu", "Plain", "/cards/2-kasu-2.png", 1, false, false, false, true)
    );

    // March
    this.cards.push(new HanafudaCard("3-hikari-1", 3, "hikari", "Curtain", "/cards/3-hikari.png", 20, true));
    this.cards.push(
      new HanafudaCard(
        "3-tan-1",
        3,
        "tan",
        "Poetry Ribbon",
        "/cards/3-tan.png",
        5,
        false,
        false,
        true,
        false,
        false,
        false,
        true
      )
    );
    this.cards.push(
      new HanafudaCard("3-kasu-1", 3, "kasu", "Plain", "/cards/3-kasu-1.png", 1, false, false, false, true)
    );
    this.cards.push(
      new HanafudaCard("3-kasu-2", 3, "kasu", "Plain", "/cards/3-kasu-2.png", 1, false, false, false, true)
    );

    // April
    this.cards.push(new HanafudaCard("4-tane-1", 4, "tane", "Cuckoo", "/cards/4-tane.png", 10, false, true));
    this.cards.push(
      new HanafudaCard("4-tan-1", 4, "tan", "Red Ribbon", "/cards/4-tan.png", 5, false, false, true, false, true)
    );
    this.cards.push(
      new HanafudaCard("4-kasu-1", 4, "kasu", "Plain", "/cards/4-kasu-1.png", 1, false, false, false, true)
    );
    this.cards.push(
      new HanafudaCard("4-kasu-2", 4, "kasu", "Plain", "/cards/4-kasu-2.png", 1, false, false, false, true)
    );

    // May
    this.cards.push(new HanafudaCard("5-tane-1", 5, "tane", "Butterflies", "/cards/5-tane.png", 10, false, true));
    this.cards.push(
      new HanafudaCard(
        "5-tan-1",
        5,
        "tan",
        "Blue Ribbon",
        "/cards/5-tan.png",
        5,
        false,
        false,
        true,
        false,
        false,
        true
      )
    );
    this.cards.push(
      new HanafudaCard("5-kasu-1", 5, "kasu", "Plain", "/cards/5-kasu-1.png", 1, false, false, false, true)
    );
    this.cards.push(
      new HanafudaCard("5-kasu-2", 5, "kasu", "Plain", "/cards/5-kasu-2.png", 1, false, false, false, true)
    );

    // June
    this.cards.push(new HanafudaCard("6-tane-1", 6, "tane", "Butterflies", "/cards/6-tane.png", 10, false, true));
    this.cards.push(
      new HanafudaCard("6-tan-1", 6, "tan", "Red Ribbon", "/cards/6-tan.png", 5, false, false, true, false, true)
    );
    this.cards.push(
      new HanafudaCard("6-kasu-1", 6, "kasu", "Plain", "/cards/6-kasu-1.png", 1, false, false, false, true)
    );
    this.cards.push(
      new HanafudaCard("6-kasu-2", 6, "kasu", "Plain", "/cards/6-kasu-2.png", 1, false, false, false, true)
    );

    // July
    this.cards.push(new HanafudaCard("7-tane-1", 7, "tane", "Boar", "/cards/7-tane.png", 10, false, true));
    this.cards.push(
      new HanafudaCard("7-tan-1", 7, "tan", "Red Ribbon", "/cards/7-tan.png", 5, false, false, true, false, true)
    );
    this.cards.push(
      new HanafudaCard("7-kasu-1", 7, "kasu", "Plain", "/cards/7-kasu-1.png", 1, false, false, false, true)
    );
    this.cards.push(
      new HanafudaCard("7-kasu-2", 7, "kasu", "Plain", "/cards/7-kasu-2.png", 1, false, false, false, true)
    );

    // August
    this.cards.push(new HanafudaCard("8-hikari-1", 8, "hikari", "Full Moon", "/cards/8-hikari.png", 20, true));
    this.cards.push(new HanafudaCard("8-tane-1", 8, "tane", "Geese", "/cards/8-tane.png", 10, false, true));
    this.cards.push(
      new HanafudaCard("8-kasu-1", 8, "kasu", "Plain", "/cards/8-kasu-1.png", 1, false, false, false, true)
    );
    this.cards.push(
      new HanafudaCard("8-kasu-2", 8, "kasu", "Plain", "/cards/8-kasu-2.png", 1, false, false, false, true)
    );

    // September
    this.cards.push(new HanafudaCard("9-hikari-1", 9, "hikari", "Sake Cup", "/cards/9-hikari.png", 20, true));
    this.cards.push(
      new HanafudaCard(
        "9-tan-1",
        9,
        "tan",
        "Blue Ribbon",
        "/cards/9-tan.png",
        5,
        false,
        false,
        true,
        false,
        false,
        true
      )
    );
    this.cards.push(
      new HanafudaCard("9-kasu-1", 9, "kasu", "Plain", "/cards/9-kasu-1.png", 1, false, false, false, true)
    );
    this.cards.push(
      new HanafudaCard("9-kasu-2", 9, "kasu", "Plain", "/cards/9-kasu-2.png", 1, false, false, false, true)
    );

    // October
    this.cards.push(new HanafudaCard("10-tane-1", 10, "tane", "Deer", "/cards/10-tane.png", 10, false, true));
    this.cards.push(
      new HanafudaCard(
        "10-tan-1",
        10,
        "tan",
        "Blue Ribbon",
        "/cards/10-tan.png",
        5,
        false,
        false,
        true,
        false,
        false,
        true
      )
    );
    this.cards.push(
      new HanafudaCard("10-kasu-1", 10, "kasu", "Plain", "/cards/10-kasu-1.png", 1, false, false, false, true)
    );
    this.cards.push(
      new HanafudaCard("10-kasu-2", 10, "kasu", "Plain", "/cards/10-kasu-2.png", 1, false, false, false, true)
    );

    // November
    this.cards.push(new HanafudaCard("11-hikari-1", 11, "hikari", "Man with Rain", "/cards/11-hikari.png", 20, true));
    this.cards.push(new HanafudaCard("11-tane-1", 11, "tane", "Swallow", "/cards/11-tane.png", 10, false, true));
    this.cards.push(
      new HanafudaCard("11-tan-1", 11, "tan", "Red Ribbon", "/cards/11-tan.png", 5, false, false, true, false, true)
    );
    this.cards.push(
      new HanafudaCard("11-kasu-1", 11, "kasu", "Lightning", "/cards/11-kasu.png", 1, false, false, false, true)
    );

    // December
    this.cards.push(new HanafudaCard("12-hikari-1", 12, "hikari", "Phoenix", "/cards/12-hikari.png", 20, true));
    this.cards.push(
      new HanafudaCard("12-kasu-1", 12, "kasu", "Plain", "/cards/12-kasu-1.png", 1, false, false, false, true)
    );
    this.cards.push(
      new HanafudaCard("12-kasu-2", 12, "kasu", "Plain", "/cards/12-kasu-2.png", 1, false, false, false, true)
    );
    this.cards.push(
      new HanafudaCard("12-kasu-3", 12, "kasu", "Plain", "/cards/12-kasu-3.png", 1, false, false, false, true)
    );
  }

  public shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  public deal(numCards: number): HanafudaCard[] {
    return this.cards.splice(0, numCards);
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
    return this.cards.filter((card) => card.month === month);
  }

  public getCardById(id: string): HanafudaCard | undefined {
    return this.cards.find((card) => card.id === id);
  }

  public static createFullDeck(): HanafudaDeck {
    const deck = new HanafudaDeck();
    deck.shuffle();
    return deck;
  }
}
