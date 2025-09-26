import { useState } from "react";

const PlayerScoresModal = ({ isOpen, onClose, gameState }) => {
  const [selectedRound, setSelectedRound] = useState(1);

  if (!isOpen) return null;

  const maxRounds = gameState?.totalRounds || 1;
  const gameScores = gameState?.gameScores || [];
  const players = gameState?.players || [];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-gray-800 text-white rounded-xl p-6 max-w-6xl w-full mx-4 shadow-2xl border-2 border-yellow-500 pointer-events-auto max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-yellow-400">Round Scores</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">
            ×
          </button>
        </div>

        {/* Round Selector */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex flex-wrap gap-2 justify-center">
            {gameScores.map(roundResult => (
              <button
                key={roundResult.round}
                onClick={() => setSelectedRound(roundResult.round)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedRound === roundResult.round ? "bg-yellow-500 text-gray-900 font-bold" : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                }`}
              >
                Round {roundResult.round}
              </button>
            ))}
          </div>
        </div>

        {/* Round Details (when a round is selected) */}
        <div className=" flex-shrink-0">
          <RoundDetails round={selectedRound} roundData={gameScores.find(r => r.round === selectedRound)} />
        </div>
      </div>
    </div>
  );
};

// Round Details Component
const RoundDetails = ({ round, roundData }) => {
  if (!roundData) {
    return <div className="text-center text-gray-400">No data available for Round {round}</div>;
  }

  const sortedRoundScores = roundData.roundScores.sort((a, b) => {
    //sort by username
    if (a.username < b.username) return -1;
    if (a.username > b.username) return 1;
    return 0;
  });

  return (
    <div>
      <h3 className="text-lg font-semibold text-yellow-300 mb-3">Round {round} Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedRoundScores.map(result => {
          const username = result.username || "Unknown Player";
          const captured = result.capturedScore || 0;
          const combos = result.comboScore || 0;
          const total = captured + combos;

          return (
            <div key={result.playerId} className="flex justify-between items-center bg-gray-700 bg-opacity-50 p-4 rounded-lg text-base">
              <span className="text-gray-200 font-medium truncate flex-1 mr-3">{username}</span>

              <div className="flex items-center space-x-4 flex-shrink-0">
                <div className="text-right">
                  <div className="text-green-400 text-sm" title="Points from captured cards">
                    Cards: {captured}
                  </div>
                  <div className="text-blue-400 text-sm" title="Points from combos">
                    Combos: +{combos}
                  </div>
                </div>
                <div className="text-yellow-400 font-mono font-bold text-lg border-l border-gray-600 pl-3" title="Total score">
                  {total}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerScoresModal;
