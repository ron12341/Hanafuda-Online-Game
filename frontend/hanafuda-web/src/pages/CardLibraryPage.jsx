import { ALLCARDS, ALL_CARDS_FLAT } from "../constants/allCards";
import { useState } from "react";

const CardLibraryPage = () => {
  const [selectedMonth, setSelectedMonth] = useState("none");
  const [selectedType, setSelectedType] = useState("none");
  const [searchTerm, setSearchTerm] = useState("");

  // Check if any filters are active
  const hasActiveFilters = selectedMonth !== "none" || selectedType !== "none" || searchTerm !== "";

  // Filter cards based on selections (only if filters are active)
  const filteredCards = hasActiveFilters
    ? ALL_CARDS_FLAT.filter(card => {
        const matchesMonth = selectedMonth === "none" || card.month === parseInt(selectedMonth);
        const matchesType = selectedType === "none" || card.type === selectedType;
        const matchesSearch = searchTerm === "" || card.name.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesMonth && matchesType && matchesSearch;
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Hanafuda Card Library</h1>
          <p className="text-gray-300">All 48 cards of the Hanafuda deck</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Search Cards</label>
              <input
                type="text"
                placeholder="Search by card name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Filter by Month</label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="none">All Months</option>
                {Object.keys(ALLCARDS).map(monthKey => (
                  <option key={monthKey} value={getMonthNumber(monthKey)}>
                    {getMonthName(monthKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Filter by Type</label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="none">All Types</option>
                <option value="hikari">Light (Hikari)</option>
                <option value="tane">Animal (Tane)</option>
                <option value="tan">Ribbon (Tan)</option>
                <option value="kasu">Plain (Kasu)</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setSelectedMonth("none");
                  setSelectedType("none");
                  setSearchTerm("");
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Show filtered cards if any filters are active */}
        {hasActiveFilters && (
          <>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Filtered Cards ({filteredCards.length} found)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
              {filteredCards.map(card => (
                <CardDisplay key={card.id} card={card} />
              ))}
            </div>

            {filteredCards.length === 0 && <div className="text-center text-gray-400 py-8">No cards found matching your filters.</div>}
          </>
        )}

        {/* Monthly Breakdown Section (always shown, but hidden when filters are active) */}
        {!hasActiveFilters && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Cards by Month</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(ALLCARDS).map(([monthKey, cards]) => (
                <MonthSection key={monthKey} monthKey={monthKey} cards={cards} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Card Component
const CardDisplay = ({ card }) => {
  const typeColors = {
    hikari: "border-yellow-400 bg-yellow-900 bg-opacity-20",
    tane: "border-green-400 bg-green-900 bg-opacity-20",
    tan: "border-blue-400 bg-blue-900 bg-opacity-20",
    kasu: "border-gray-400 bg-gray-900 bg-opacity-20",
  };

  return (
    <div className={`card-item p-3 rounded-lg border-2 ${typeColors[card.type]} transition-transform hover:scale-105`}>
      <img src={`/cards/${card.id}.png`} alt={card.name} className="w-full h-32 object-cover rounded mb-2" />
      <div className="text-center">
        <div className="text-white font-medium text-sm mb-1">{card.name}</div>
      </div>
    </div>
  );
};

// Monthly Section Component
const MonthSection = ({ monthKey, cards }) => {
  return (
    <div className="month-section bg-gray-800 rounded-lg p-4">
      <h3 className="text-xl font-semibold text-white mb-3">
        {getMonthName(monthKey)} (Month {getMonthNumber(monthKey)})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map(card => (
          <CardDisplay key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
};

// Helper functions
const getMonthName = monthKey => {
  const monthNames = {
    jan: "January - Pine",
    feb: "February - Plum Blossom",
    mar: "March - Cherry Blossom",
    apr: "April - Wisteria",
    may: "May - Iris",
    jun: "June - Peony",
    jul: "July - Bush Clover",
    aug: "August - Susuki Grass",
    sep: "September - Chrysanthemum",
    oct: "October - Maple",
    nov: "November - Willow",
    dec: "December - Paulownia",
  };
  return monthNames[monthKey] || monthKey;
};

const getMonthNumber = monthKey => {
  const monthNumbers = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  };
  return monthNumbers[monthKey];
};

export default CardLibraryPage;
