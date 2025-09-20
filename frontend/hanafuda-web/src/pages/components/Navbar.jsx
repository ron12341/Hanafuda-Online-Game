import { usePlayer } from "../../contexts/PlayerContext";
import { useSocket } from "../../contexts/SocketContext";

export default function Navbar() {
  const { player } = usePlayer();
  const { isConnected, disconnectSocket } = useSocket();

  const getConnectionStatus = (isConnected, player) => {
    if (!isConnected) return { text: "Disconnected", color: "red" };
    if (player.gameId) return { text: "In Game", color: "green" };
    if (player.roomId) return { text: "In Room", color: "blue" };
    return { text: "Connected", color: "green" };
  };

  const status = getConnectionStatus(isConnected, player);

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Branding */}
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold text-white">🎴 Hanafuda Online</h1>
        </div>

        {/* Right side - User info */}
        <div className="flex items-center space-x-4">
          {/* Connection status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full bg-${status.color}-400 animate-pulse`} title={status.text} />
            <p className="text-white text-sm font-medium">{status.text}</p>
          </div>

          {/* User info */}
          <div className="text-right">
            <p className="text-white text-sm font-medium">{player.username}</p>
            <p className="text-gray-400 text-xs">ID: {player.playerId.slice(0, 8)}</p>
          </div>

          {/* Disconnect button - more compact */}
          <button
            onClick={disconnectSocket}
            className="px-2 py-1 text-red-300 border border-red-500 rounded-md hover:bg-red-600 hover:text-white text-sm transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    </nav>
  );
}
