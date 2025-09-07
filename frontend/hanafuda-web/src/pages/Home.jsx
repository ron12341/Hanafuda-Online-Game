import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { usePlayer } from "../contexts/PlayerContext";

export default function Home() {
  const { connectSocket, socket } = useSocket();
  const { setPlayer, player } = usePlayer();

  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError("Please enter a name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      connectSocket(playerName);
      console.log(socket);
      setPlayer({ name: playerName });

      // set connection timeout
      const timeout = setTimeout(() => {
        setError("Connection timed out");
        setLoading(false);
      }, 5000);

      // check if player is connected
      const checkPlayer = setInterval(() => {
        if (player) {
          clearInterval(checkPlayer);
          clearTimeout(timeout);
          setLoading(false);
        }
      }, 100);

      console.log("Navigating to /lobby");
      navigate("/lobby");
    } catch (err) {
      setError("Failed to connect");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Welcome to Hanafuda</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="playerName" className="block text-sm font-medium text-white/80">
              Enter Your Name:
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent disabled:opacity-50"
              placeholder="Your player name"
            />
          </div>

          {error && <div className="p-3 bg-red-500/80 text-white rounded-lg text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all
            ${
              loading
                ? "bg-purple-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-500 hover:shadow-lg hover:-translate-y-0.5 transform transition"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connecting...
              </span>
            ) : (
              "Enter Lobby"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
