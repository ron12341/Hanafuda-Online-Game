export const ALLCARDS = {
  jan: [
    { id: "1-kasu-1", name: "Pine Kasu", month: 1, type: "kasu" },
    { id: "1-kasu-2", name: "Pine Kasu", month: 1, type: "kasu" },
    { id: "1-tan", name: "Pine Poetry Ribbon", month: 1, type: "tan" },
    { id: "1-hikari", name: "Crane and Pine", month: 1, type: "hikari" },
  ],
  feb: [
    { id: "2-kasu-1", name: "Plum Blossom Kasu", month: 2, type: "kasu" },
    { id: "2-kasu-2", name: "Plum Blossom Kasu", month: 2, type: "kasu" },
    { id: "2-tan", name: "Plum Poetry Ribbon", month: 2, type: "tan" },
    { id: "2-tane", name: "Bush Warbler", month: 2, type: "tane" },
  ],
  mar: [
    { id: "3-kasu-1", name: "Cherry Blossom Kasu", month: 3, type: "kasu" },
    { id: "3-kasu-2", name: "Cherry Blossom Kasu", month: 3, type: "kasu" },
    { id: "3-tan", name: "Cherry Poetry Ribbon", month: 3, type: "tan" },
    { id: "3-hikari", name: "Curtain and Cherry Blossoms", month: 3, type: "hikari" },
  ],
  apr: [
    { id: "4-kasu-1", name: "Wisteria Kasu", month: 4, type: "kasu" },
    { id: "4-kasu-2", name: "Wisteria Kasu", month: 4, type: "kasu" },
    { id: "4-tan", name: "Wisteria Ribbon", month: 4, type: "tan" },
    { id: "4-tane", name: "Cuckoo", month: 4, type: "tane" },
  ],
  may: [
    { id: "5-kasu-1", name: "Iris Kasu", month: 5, type: "kasu" },
    { id: "5-kasu-2", name: "Iris Kasu", month: 5, type: "kasu" },
    { id: "5-tan", name: "Iris Ribbon", month: 5, type: "tan" },
    { id: "5-tane", name: "Eight-Plank Bridge", month: 5, type: "tane" },
  ],
  jun: [
    { id: "6-kasu-1", name: "Peony Kasu", month: 6, type: "kasu" },
    { id: "6-kasu-2", name: "Peony Kasu", month: 6, type: "kasu" },
    { id: "6-tan", name: "Blue Peony Ribbon", month: 6, type: "tan" },
    { id: "6-tane", name: "Butterflies", month: 6, type: "tane" },
  ],
  jul: [
    { id: "7-kasu-1", name: "Bush Clover Kasu", month: 7, type: "kasu" },
    { id: "7-kasu-2", name: "Bush Clover Kasu", month: 7, type: "kasu" },
    { id: "7-tan", name: "Bush Clover Ribbon", month: 7, type: "tan" },
    { id: "7-tane", name: "Boar", month: 7, type: "tane" },
  ],
  aug: [
    { id: "8-kasu-1", name: "Susuki Grass Kasu", month: 8, type: "kasu" },
    { id: "8-kasu-2", name: "Susuki Grass Kasu", month: 8, type: "kasu" },
    { id: "8-tane", name: "Geese", month: 8, type: "tane" },
    { id: "8-hikari", name: "Full Moon", month: 8, type: "hikari" },
  ],
  sep: [
    { id: "9-kasu-1", name: "Chrysanthemum Kasu", month: 9, type: "kasu" },
    { id: "9-kasu-2", name: "Chrysanthemum Kasu", month: 9, type: "kasu" },
    { id: "9-tan", name: "Blue Chrysanthemum Ribbon", month: 9, type: "tan" },
    { id: "9-tane", name: "Sake Cup", month: 9, type: "tane" },
  ],
  oct: [
    { id: "10-kasu-1", name: "Maple Kasu", month: 10, type: "kasu" },
    { id: "10-kasu-2", name: "Maple Kasu", month: 10, type: "kasu" },
    { id: "10-tan", name: "Blue Maple Ribbon", month: 10, type: "tan" },
    { id: "10-tane", name: "Deer", month: 10, type: "tane" },
  ],
  nov: [
    { id: "11-kasu", name: "Willow Kasu", month: 11, type: "kasu" },
    { id: "11-tan", name: "Willow Ribbon", month: 11, type: "tan" },
    { id: "11-tane", name: "Swallow", month: 11, type: "tane" },
    { id: "11-hikari", name: "Rainman", month: 11, type: "hikari" },
  ],
  dec: [
    { id: "12-kasu-1", name: "Paulownia Kasu", month: 12, type: "kasu" },
    { id: "12-kasu-2", name: "Paulownia Kasu", month: 12, type: "kasu" },
    { id: "12-kasu-3", name: "Paulownia Kasu", month: 12, type: "kasu" },
    { id: "12-hikari", name: "Phoenix", month: 12, type: "hikari" },
  ],
};

// Helper function to get all cards as a flat array
export const ALL_CARDS_FLAT = Object.values(ALLCARDS).flat();

// Helper function to get cards by type
export const getCardsByType = type => {
  return ALL_CARDS_FLAT.filter(card => card.type === type);
};

// Helper function to get cards by month
export const getCardsByMonth = month => {
  return ALL_CARDS_FLAT.filter(card => card.month === month);
};
