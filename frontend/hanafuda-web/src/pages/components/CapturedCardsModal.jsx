import { useState } from "react";
import Card from "./Card";

const CapturedCardsModal = ({ isOpen, onClose, playerUsername, capturedCards = [] }) => {
  if (!isOpen) return null;

  // Organize cards by month for better display
  const cardsByMonth = {};
  capturedCards.forEach(card => {
    if (!cardsByMonth[card.month]) {
      cardsByMonth[card.month] = [];
    }
    cardsByMonth[card.month].push(card);
  });

  const totalScore = capturedCards.reduce((acc, card) => acc + card.points, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{playerUsername || "Player"}'s Captured Cards</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold">
            ×
          </button>
        </div>

        {/* Score Summary */}
        <div className="bg-gray-100 p-4 border-b">
          <div className="flex justify-between items-center text-gray-700">
            <div>
              <h3 className="text-lg font-semibold">Total Score: {totalScore}</h3>
              <p className="text-sm text-gray-600">{capturedCards.length} cards captured</p>
            </div>
          </div>
        </div>

        {/* Cards by Month */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {Object.keys(cardsByMonth).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No cards captured yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(cardsByMonth)
                .sort(([monthA], [monthB]) => parseInt(monthA) - parseInt(monthB))
                .map(([month, monthCards]) => (
                  <div key={month} className="border-b pb-4 last:border-b-0">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">
                      Month {month} ({monthCards.length} cards)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {monthCards.map(card => (
                        <div key={card.id} className="flex flex-col items-center">
                          <Card card={card} size="small" src={card.image} alt={card.name} cardType="table" />
                          <span className="text-xs text-gray-600 mt-1">{card.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 flex justify-end">
          <button onClick={onClose} className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CapturedCardsModal;
