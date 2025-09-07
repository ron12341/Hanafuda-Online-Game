import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { usePlayer } from "../contexts/PlayerContext";
import { useLobby } from "../contexts/LobbyContext";

export default function LobbyPage() {
  const { username, playerId } = usePlayer();
  const { isConnected } = useSocket();
  const {
    rooms,
    waitingPlayers,
    isLoading,
    isCreatingRoom,
    isJoiningRoom,
    error,
    createRoomError,
    joinRoomError,
    fetchLobbyData,
    createRoom,
    joinRoom,
    clearErrors,
  } = useLobby();

  const navigate = useNavigate();
  const [newRoomName, setNewRoomName] = useState("");
  const [localError, setLocalError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [roomSettings, setRoomSettings] = useState({
    maxPlayers: 4,
    totalRounds: 3,
    visibility: "public",
    password: "",
  });

  useEffect(() => {
    if (isConnected) {
      fetchLobbyData();
    }
  }, [isConnected]);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      setLocalError("Room name cannot be empty");
      return;
    }

    if (newRoomName.trim().length < 3) {
      setLocalError("Room name must be at least 3 characters");
      return;
    }

    setLocalError("");
    clearErrors();

    const result = await createRoom(newRoomName.trim(), roomSettings);

    if (result.success) {
      setNewRoomName("");
      setRoomSettings({
        maxPlayers: 4,
        totalRounds: 3,
        visibility: "public",
        password: "",
      });
      navigate(`/room/${result.roomId}`);
    } else {
      setLocalError(result.error);
    }
  };

  const handleJoinRoom = async (roomId) => {
    clearErrors();
    setLocalError("");

    const result = await joinRoom(roomId);

    if (result.success) {
      navigate(`/room/${roomId}`);
    } else {
      setLocalError(result.error);
    }
  };

  const handleRefresh = () => {
    setLocalError("");
    clearErrors();
    fetchLobbyData();
  };

  const handleSettingsChange = (field, value) => {
    setRoomSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isConnected) {
    return (
      <div className="p-4 text-center">
        <div className="text-lg">Connecting to server...</div>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="lobby-container max-w-4xl mx-auto p-6">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4">Room Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Max Players</label>
                <select
                  value={roomSettings.maxPlayers}
                  onChange={(e) => handleSettingsChange("maxPlayers", parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={2}>2 Players</option>
                  <option value={3}>3 Players</option>
                  <option value={4}>4 Players</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Total Rounds</label>
                <select
                  value={roomSettings.totalRounds}
                  onChange={(e) => handleSettingsChange("totalRounds", parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={1}>1 Round</option>
                  <option value={3}>3 Rounds</option>
                  <option value={5}>5 Rounds</option>
                  <option value={7}>7 Rounds</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Visibility</label>
                <select
                  value={roomSettings.visibility}
                  onChange={(e) => handleSettingsChange("visibility", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {roomSettings.visibility === "private" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password (Optional)</label>
                  <input
                    type="password"
                    value={roomSettings.password}
                    onChange={(e) => handleSettingsChange("password", e.target.value)}
                    placeholder="Enter password"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                  handleCreateRoom();
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Hanafuda Game Lobby</h1>
        <p className="text-gray-600">Welcome, {username}!</p>
        <div
          className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${
            isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          ● {isConnected ? "Connected" : "Disconnected"}
        </div>
      </header>

      {/* Create Room Section */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Room</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => {
              setNewRoomName(e.target.value);
              setLocalError("");
            }}
            placeholder="Enter room name (min. 3 characters)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isCreatingRoom}
            onKeyPress={(e) => e.key === "Enter" && setShowSettings(true)}
          />
          <button
            onClick={() => setShowSettings(true)}
            disabled={isCreatingRoom || !newRoomName.trim() || newRoomName.trim().length < 3}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCreatingRoom ? "Creating..." : "Create Room"}
          </button>
        </div>

        <div className="text-sm text-gray-600 mb-2">
          Current settings: {roomSettings.maxPlayers} players • {roomSettings.totalRounds} rounds •{" "}
          {roomSettings.visibility}
        </div>

        {(localError || createRoomError) && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md">{localError || createRoomError}</div>
        )}
      </section>

      {/* Rooms List */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Available Rooms ({rooms.length})</h2>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            {isLoading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No rooms available. Create one to start playing!</p>
        ) : (
          <div className="grid gap-3">
            {rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{room.name}</h3>
                  <p className="text-sm text-gray-600">
                    Players: {room.players?.length || 0}/{room.settings?.maxPlayers || 4} • Rounds:{" "}
                    {room.settings?.totalRounds || 3} •
                    {room.settings?.visibility === "private" ? " 🔒 Private" : " 🌐 Public"}
                  </p>
                </div>
                <button
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={isJoiningRoom || (room.players?.length || 0) >= (room.settings?.maxPlayers || 4)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isJoiningRoom
                    ? "Joining..."
                    : (room.players?.length || 0) >= (room.settings?.maxPlayers || 4)
                    ? "Full"
                    : "Join"}
                </button>
              </div>
            ))}
          </div>
        )}

        {joinRoomError && <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-md">{joinRoomError}</div>}
      </section>

      {/* Online Players */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Online Players ({waitingPlayers.length})</h2>

        {waitingPlayers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No players online</p>
        ) : (
          <div className="grid gap-2">
            {waitingPlayers.map((player) => (
              <div
                key={player.id}
                className={`flex items-center p-3 rounded-md ${
                  player.id === playerId ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                }`}
              >
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium">
                  {player.name} {player.id === playerId && "(You)"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
