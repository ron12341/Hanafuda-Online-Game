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
      <div className="relative bg-gray-800 text-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-yellow-500 transform animate-pop-in pointer-events-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">{"ROUND ENDED"}</h2>
          <p className="text-xl mb-6 text-gray-200">{message}</p>

          {/* Round results display */}
          {roundResult.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-yellow-300 mb-3">Round Results</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {roundResult.map((result, index) => (
                  <div key={result.playerId} className="flex justify-between items-center bg-gray-700 bg-opacity-50 p-2 rounded">
                    <span className="text-gray-200">{result.username}</span>
                    <span className="font-mono text-yellow-400">{result.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Countdown number */}
          <div className={`text-6xl font-mono mb-6 ${countdown === 0 ? "text-green-400 animate-pulse" : "text-white"}`}>{countdown}</div>

          {/* Progress bar container */}
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-6">
            {/* Smoothly animated progress bar */}
            <div
              className="h-2.5 rounded-full transition-all duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                backgroundColor: countdown === 0 ? "#10B981" : "#F59E0B",
              }}
            ></div>
          </div>

          {/* Progress percentage text
          <div className="text-sm text-gray-400 mt-2">{`${Math.round(progress)}% complete`}</div> */}
        </div>
      </div>
    </div>
  );
};

export default RoundTransitionModal;
