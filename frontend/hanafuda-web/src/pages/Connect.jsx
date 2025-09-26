import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { usePlayer } from "../contexts/PlayerContext";

const Connect = () => {
  const { player, setUsername, setStatus } = usePlayer();
  const { username: savedUsername, sessionToken } = player;
  const { connectSocket, isConnected, connectionError, isSocketLoading } = useSocket();

  const [inputUsername, setInputUsername] = useState(savedUsername || "");
  const [isConnecting, setIsConnecting] = useState(false);
  const [localError, setLocalError] = useState("");

  const navigate = useNavigate();

  // Auto-redirect when connected
  useEffect(() => {
    if (isSocketLoading) return;
    if (isConnected && player.status === "connected") {
      while (player.status === "connecting") {}

      navigate("/lobby", { replace: true });
    }
  }, [isConnected, player.status, navigate, isSocketLoading]);

  const handleConnect = async () => {
    if (!validateUsername(inputUsername)) return;

    setIsConnecting(true);
    setLocalError("");
    setStatus("connecting");

    try {
      setUsername(inputUsername.trim());
      await connectSocket(inputUsername.trim());
    } catch (error) {
      console.error("Connection failed:", error);
      setLocalError(error.message || "Connection failed");
      setStatus("error");
    } finally {
      setIsConnecting(false);
    }
  };

  const validateUsername = name => {
    const trimmed = name.trim();

    if (!trimmed) {
      setLocalError("Username cannot be empty");
      return false;
    }

    if (trimmed.length < 3) {
      setLocalError("Username must be at least 3 characters");
      return false;
    }

    if (trimmed.length > 20) {
      setLocalError("Username must be less than 20 characters");
      return false;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setLocalError("Username can only contain letters, numbers, underscores, and hyphens");
      return false;
    }

    return true;
  };

  const handleKeyPress = e => {
    if (e.key === "Enter") {
      handleConnect();
    }
  };

  const handleRetry = () => {
    setLocalError("");
    if (savedUsername) {
      handleConnect();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br bg-slate-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">🎴</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hanafuda Online</h1>
          <p className="text-gray-600">Join the traditional Japanese card game</p>
        </div>

        {/* Connection Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={inputUsername}
              onChange={e => {
                setInputUsername(e.target.value);
                setLocalError("");
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
              disabled={isConnecting}
              maxLength={20}
              autoComplete="username"
            />
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting || !inputUsername.trim()}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
          >
            {isConnecting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connecting...
              </>
            ) : sessionToken ? (
              "Reconnect"
            ) : (
              "Connect to Game"
            )}
          </button>
        </div>

        {/* Error Messages */}
        {(localError || connectionError) && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-800 font-medium">{localError || connectionError}</span>
            </div>
            {connectionError && (
              <button
                onClick={handleRetry}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
              >
                Retry Connection
              </button>
            )}
          </div>
        )}

        {/* Success Message */}
        {isConnected && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-green-800 font-medium">Connected successfully! Redirecting...</span>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Username Requirements</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-center">
              <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              2-20 characters
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Letters, numbers, _ and -
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Connect;
