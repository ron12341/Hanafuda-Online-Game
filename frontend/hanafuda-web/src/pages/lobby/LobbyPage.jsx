import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLobby } from "../../contexts/LobbyContext";
import { useSocket } from "../../contexts/SocketContext";
import { usePlayer } from "../../contexts/PlayerContext";

import SettingsModal from "./components/SettingsModal";
import RoomList from "./components/RoomList";
import OnlinePlayersList from "./components/OnlinePlayersList";
import CreateRoomSection from "./components/CreateRoomSection";

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

  const handleJoinRoom = async roomId => {
    clearErrors();
    setLocalError("");

    const result = await joinRoom(roomId);

    console.log(result);
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
    setRoomSettings(prev => ({
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
    <div className="lobby-container max-w-4xl mx-auto p-6 min-h-screen min-w-full bg-gray-800">
      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        roomSettings={roomSettings}
        handleSettingsChange={handleSettingsChange}
        handleCreateRoom={handleCreateRoom}
      />

      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Hanafuda Game Lobby</h1>
        <p className="text-gray-600">Welcome, {username}!</p>
        <div
          className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          ● {isConnected ? "Connected" : "Disconnected"}
        </div>
      </header>

      <CreateRoomSection
        newRoomName={newRoomName}
        setNewRoomName={setNewRoomName}
        roomSettings={roomSettings}
        isCreatingRoom={isCreatingRoom}
        localError={localError}
        createRoomError={createRoomError}
        setShowSettings={setShowSettings}
        setLocalError={setLocalError}
      />

      <RoomList
        rooms={rooms}
        isLoading={isLoading}
        isJoiningRoom={isJoiningRoom}
        joinRoomError={joinRoomError}
        handleJoinRoom={handleJoinRoom}
        handleRefresh={handleRefresh}
      />

      <OnlinePlayersList waitingPlayers={waitingPlayers} playerId={playerId} />
    </div>
  );
}
