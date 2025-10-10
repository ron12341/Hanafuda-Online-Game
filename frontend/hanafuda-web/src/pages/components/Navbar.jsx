import { usePlayer } from "../../contexts/PlayerContext";
import { useSocket } from "../../contexts/SocketContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const { player } = usePlayer();
  const { isConnected, disconnectSocket } = useSocket();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getConnectionStatus = (isConnected, player) => {
    if (!isConnected) return { text: "Disconnected", bg: "bg-red-500" };
    if (player.gameId) return { text: "In Game", bg: "bg-yellow-500" };
    if (player.roomId) return { text: "In Room", bg: "bg-blue-500" };
    return { text: "Connected", bg: "bg-green-500" };
  };

  const status = getConnectionStatus(isConnected, player);

  const handleDisconnect = () => {
    disconnectSocket();
    setIsMenuOpen(false);
  };

  const handleConnect = () => {
    navigate("/", { replace: true });
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Branding */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <h1 className="text-lg sm:text-xl font-bold text-white truncate max-w-[140px] sm:max-w-none">🎴 Hanafuda Online</h1>
        </div>

        {/* Right side - User info */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Connection status - hidden on mobile, visible on sm+ */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${status.bg} animate-pulse`} title={status.text} />
            <p className="text-white text-sm font-medium">{status.text}</p>
          </div>

          {/* Mobile connection status indicator only */}
          <div className="sm:hidden flex items-center">
            <div className={`w-2 h-2 rounded-full ${status.bg} animate-pulse`} title={status.text} />
          </div>

          {/* User info - hidden on mobile, visible on sm+ */}
          <div className="hidden sm:block text-right">
            <p className="text-white text-sm font-medium">{player.username}</p>
            <p className="text-gray-400 text-xs">ID: {player.playerId.slice(0, 8)}</p>
          </div>

          {/* Desktop buttons */}
          {player.status === "connected" && isConnected && (
            <>
              <button
                onClick={disconnectSocket}
                className="hidden sm:block px-3 py-1 text-red-300 border border-red-500 rounded-md hover:bg-red-600 hover:text-white text-sm transition-colors"
              >
                Disconnect
              </button>

              {/* Mobile menu button */}
              <div className="sm:hidden relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {isMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />

                    {/* Menu */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 py-1">
                      <div className="px-4 py-2 border-b border-gray-600">
                        <p className="text-white text-sm font-medium truncate">{player.username}</p>
                        <p className="text-gray-400 text-xs truncate">ID: {player.playerId.slice(0, 8)}</p>
                      </div>

                      <div className="px-4 py-2 border-b border-gray-600">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${status.bg} animate-pulse`} />
                          <p className="text-white text-sm">{status.text}</p>
                        </div>
                      </div>

                      <button
                        onClick={handleDisconnect}
                        className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-600 hover:text-white transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {player.status === "disconnected" && !isConnected && (
            <>
              <button
                onClick={handleConnect}
                className="hidden sm:block px-3 py-1 text-green-300 border border-green-500 rounded-md hover:bg-green-600 hover:text-white text-sm transition-colors"
              >
                Connect
              </button>

              {/* Mobile connect button */}
              <button
                onClick={handleConnect}
                className="sm:hidden px-3 py-1 text-green-300 border border-green-500 rounded-md hover:bg-green-600 hover:text-white text-sm transition-colors"
              >
                Join
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
