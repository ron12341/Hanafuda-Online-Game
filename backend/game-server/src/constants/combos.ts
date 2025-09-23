export interface ComboInterface {
  id: string;
  name: string;
  points: number;
  cards: string[];
  requiredCount?: number;
  exclude?: string[];
  description: string;
}

export const COMBOS: { [key: string]: ComboInterface } = {
  FIVE_LIGHTS: {
    id: "five_lights",
    name: "Five Lights",
    points: 100,
    cards: ["12-hikari", "11-hikari", "8-hikari", "3-hikari", "1-hikari"],
    description: "All five light cards",
  },
  FOUR_LIGHTS: {
    id: "four_lights",
    name: "Four Lights",
    points: 50,
    cards: ["12-hikari", "11-hikari", "8-hikari", "3-hikari", "1-hikari"],
    requiredCount: 4,
    description: "Any four light cards",
  },
  THREE_LIGHTS: {
    id: "three_lights",
    name: "Three Lights",
    points: 30,
    cards: ["12-hikari", "8-hikari", "3-hikari", "1-hikari"],
    exclude: ["paulownia-1"],
    requiredCount: 3,
    description: "Any three light cards (excluding Rainman)",
  },
  BLUE_RIBBONS: {
    id: "blue_ribbons",
    name: "Blue Ribbons",
    points: 35,
    cards: ["10-tan", "9-tan", "6-tan"],
    description: "Three blue ribbon cards",
  },
  WRITTEN_RIBBONS: {
    id: "written_ribbons",
    name: "Written Ribbons",
    points: 35,
    cards: ["3-tan", "2-tan", "1-tan"],
    description: "Three written poetry ribbon cards",
  },
  SEVEN_RIBBONS: {
    id: "seven_ribbons",
    name: "Seven Ribbons",
    points: 35,
    cards: ["10-tan", "9-tan", "6-tan", "3-tan", "2-tan", "1-tan", "11-tan", "7-tan", "5-tan", "4-tan"],
    requiredCount: 7,
    description: "Any seven ribbon cards",
  },
  APRIL_SET: {
    id: "april_set",
    name: "April Set",
    points: 10,
    cards: ["4-tane", "4-tan", "4-kasu-2", "4-kasu-1"],
    description: "All April cards",
  },
  DECEMBER_SET: {
    id: "december_set",
    name: "December Set",
    points: 10,
    cards: ["12-kasu-3", "12-kasu-2", "12-kasu-1", "12-hikari"],
    description: "All December cards",
  },
};
