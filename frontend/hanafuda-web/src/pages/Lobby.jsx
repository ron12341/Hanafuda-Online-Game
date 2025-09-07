import { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";

const Lobby = () => {
  const { socket, isConnected, emitSafe } = useSocket();
  const [players, setPlayers] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Set up lobby-specific listeners
    const handleLobbyUpdate = (data) => {
      console.log("Lobby update received:", data);
      setPlayers(data.players || []);
      setRooms(data.rooms || []);
    };

    socket.on("lobby-state", handleLobbyUpdate);

    // Request initial state
    emitSafe("request-lobby-state");

    // Cleanup
    return () => {
      socket.off("lobby-state", handleLobbyUpdate);
    };
  }, [socket, emitSafe]);

  const handleJoinRoom = (roomId) => {
    emitSafe("join-room", { roomId });
  };

  const handleCreateRoom = () => {
    const roomName = prompt("Enter room name:") || "Game Room";
    emitSafe("create-room", roomName);
  };

  if (!isConnected) {
    return <div className="p-4 text-center">Connecting to server...</div>;
  }

  // Filter waiting players (those not in a room)
  const waitingPlayers = players.filter((player) => !player.roomId);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Game Lobby</h2>
        <button onClick={handleCreateRoom} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Create Room
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waiting Players Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Waiting Players ({waitingPlayers.length})</h3>
          {waitingPlayers.length === 0 ? (
            <p className="text-gray-500 text-center">No players waiting</p>
          ) : (
            <div className="space-y-2">
              {waitingPlayers.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                    <span className="font-medium">{player.username}</span>
                  </div>
                  <span className="text-sm text-gray-500">Online</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Rooms Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Available Rooms ({rooms.length})</h3>
          </div>

          {rooms.length === 0 ? (
            <p className="text-gray-500 text-center">No rooms available</p>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => {
                const roomPlayers = players.filter((player) => player.roomId === room.id);
                const playerCount = roomPlayers.length;
                const maxPlayers = room.maxPlayers || 4; // Default to 4 players max

                return (
                  <div key={room.id} className="p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{room.name || `Room ${room.id}`}</h4>
                        <p className="text-sm text-gray-600">
                          {playerCount}/{maxPlayers} players
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          room.status === "waiting" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {room.status || "waiting"}
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Players in room:</p>
                      <div className="space-y-1">
                        {roomPlayers.map((player) => (
                          <div key={player.id} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                            {player.username}
                            {player.ready && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 rounded">Ready</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={playerCount >= maxPlayers}
                      className={`w-full py-2 px-4 rounded text-sm font-medium ${
                        playerCount >= maxPlayers
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {playerCount >= maxPlayers ? "Room Full" : "Join Room"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
