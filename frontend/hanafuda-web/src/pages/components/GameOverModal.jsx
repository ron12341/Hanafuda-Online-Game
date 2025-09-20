import { useState, useEffect } from "react";

const GameOverModal = ({ isGameOver, winner, scores, onExit }) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isGameOver) {
      // Small delay for animation
      setTimeout(() => setShowAnimation(true), 100);
    }
  }, [isGameOver]);

  if (!isGameOver) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>

      {/* Game Over Modal */}
      <div
        className={`relative bg-gray-800 text-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border-4 border-red-500 transform transition-all duration-500 ${
          showAnimation ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <div className="text-center">
          {/* Game Over Title */}
          <h2 className="text-4xl font-bold text-red-400 mb-2 animate-pulse">GAME OVER</h2>

          {/* Winner Announcement */}
          {winner && (
            <div className="mb-6">
              <p className="text-xl text-gray-200">Winner:</p>
              <p className="text-2xl font-bold text-yellow-400 mt-2">{winner}</p>
            </div>
          )}

          {/* Final Scores */}
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-300 mb-3">Final Scores</h3>
            <div className="space-y-2">
              {scores.map(({ username, score }) => (
                <div key={username} className="flex justify-between items-center">
                  <span className="text-gray-200">{username}</span>
                  <span className="text-lg font-bold">{score} points</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button onClick={onExit} className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition">
              Exit Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
