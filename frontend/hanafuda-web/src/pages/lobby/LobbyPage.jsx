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
  const { playerId, player } = usePlayer();
  const { isConnected, isSocketLoading } = useSocket();
  const {
    rooms,
    waitingPlayers,
    isCreatingRoom,
    isJoiningRoom,
    error,
    createRoomError,
    joinRoomError,
    fetchLobbyData,
    createRoom,
    joinRoom,
    clearErrors,
    getStats,
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (player.status === "disconnected") {
      navigate("/", { replace: true });
    }

    if (isSocketLoading) return;
    setIsLoading(true);
    try {
      // if (player.gameId) {
      //   navigate(`/game/${player.gameId}`, { replace: true });
      //   return;
      // }

      // if (player.roomId) {
      //   navigate(`/room/${player.roomId}`, { replace: true });
      //   return;
      // }

      fetchLobbyData();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, isSocketLoading, player.status]);

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

    if (result.success) {
      navigate(`/room/${roomId}`);
    } else {
      setLocalError(result.error);
    }
  };

  const handleSettingsChange = (field, value) => {
    setRoomSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-800">
      <div className="max-w-4xl mx-auto">
        <SettingsModal
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          roomSettings={roomSettings}
          handleSettingsChange={handleSettingsChange}
          handleCreateRoom={handleCreateRoom}
        />

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

        <RoomList rooms={rooms} isLoading={isLoading} isJoiningRoom={isJoiningRoom} joinRoomError={joinRoomError} handleJoinRoom={handleJoinRoom} />

        <OnlinePlayersList waitingPlayers={waitingPlayers} playerId={playerId} />
      </div>
    </div>
  );
}
