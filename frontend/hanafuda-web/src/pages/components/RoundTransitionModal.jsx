import { useState, useEffect, useRef } from "react";

const RoundTransitionModal = ({ duration = 5, message = "Round ended - Starting new round in...", roundResult = [] }) => {
  const [countdown, setCountdown] = useState(duration);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const countdownRef = useRef(null);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // Initialize values
    setCountdown(duration);
    setProgress(0);
    setIsVisible(true);
    startTimeRef.current = Date.now();

    // Set up the countdown interval (updates every second)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          // Keep visible for one more second to show completion
          setTimeout(() => setIsVisible(false), 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Set up the progress animation (updates continuously)
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min(100, (elapsed / (duration * 1000)) * 100);
      setProgress(newProgress);

      // Stop the progress animation when complete
      if (newProgress >= 100) {
        clearInterval(progressRef.current);
      }
    }, 1000 / 60); // ~60fps

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      {/* Notification card */}
      <div className="relative bg-gray-800 text-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-yellow-500 transform animate-pop-in pointer-events-auto max-h-[90vh] overflow-hidden flex flex-col">
        <div className="text-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">{"ROUND ENDED"}</h2>
          <p className="text-lg mb-4 text-gray-200">{message}</p>
        </div>

        {/* Round results display with scroll if needed */}
        {roundResult.length > 0 && (
          <div className="mb-4 flex-1 min-h-0 overflow-hidden">
            <h3 className="text-lg font-semibold text-yellow-300 mb-2 text-center">Round Results</h3>
            <div className="space-y-2 overflow-y-auto pr-1">
              {roundResult.map((result, index) => {
                const captured = result.capturedScore || 0;
                const combos = result.comboScore || 0;
                const total = captured + combos;

                return (
                  <div key={result.playerId} className="flex justify-between items-center bg-gray-700 bg-opacity-50 p-2 rounded text-sm">
                    <span className="text-gray-200 font-medium truncate flex-1 mr-2">{result.username}</span>

                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-green-400 text-xs" title="Points from captured cards">
                          Cards: {captured}
                        </div>
                        <div className="text-blue-400 text-xs" title="Points from combos">
                          Combos: +{combos}
                        </div>
                      </div>
                      <div className="text-yellow-400 font-mono font-bold border-l border-gray-600 pl-2" title="Total score">
                        {total}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Countdown and progress bar */}
        <div className="flex-shrink-0">
          {/* Countdown number */}
          <div className={`text-5xl font-mono mb-4 text-center ${countdown === 0 ? "text-green-400 animate-pulse" : "text-white"}`}>{countdown}</div>

          {/* Progress bar container */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
            <div
              className="h-2 rounded-full transition-all duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                backgroundColor: countdown === 0 ? "#10B981" : "#F59E0B",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundTransitionModal;
