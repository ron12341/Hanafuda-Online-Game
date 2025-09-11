import { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { usePlayer } from "../contexts/PlayerContext";
import { useRoom } from "../contexts/RoomContext";
import { useParams, useNavigate } from "react-router-dom";

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { player, setIsReady } = usePlayer();
  const { socket, isConnected, emitSafe } = useSocket();
  const {
    room,

    //actions
    clearErrors,
    leaveRoom,
    changeReady,
    fetchRoomData,
    startGame,
  } = useRoom();

  const [localError, setLocalError] = useState("");

  // Join room and fetch data when component mounts or roomId changes
  useEffect(() => {
    if (!isConnected || !roomId) return;

    // Check if player is in the correct room
    if (player.roomId !== roomId) {
      setLocalError("You're not in this room. Redirecting...");
      setTimeout(() => navigate("/lobby"), 2000);
      return;
    }

    // Fetch room data
    fetchRoomData(roomId);
  }, [isConnected, roomId, player.roomId, navigate]);

  useEffect(() => {
    if (room.status === "playing") {
      navigate(`/game/${room.id}`);
    }
  }, [room.status]);

  const handleToggleReady = async () => {
    console.log("Toggling ready: ", player.isReady);
    if (!isConnected || !roomId) return;

    const result = await changeReady(!player.isReady);
    if (result.success) {
      setIsReady(result.isReady);
    } else {
      setLocalError(result.error);
    }
  };

  const handleLeaveRoom = async () => {
    console.log("Leaving Room: ", roomId);
    const result = await leaveRoom();
    if (result.success) {
      setTimeout(() => navigate("/lobby"), 100);
    } else {
      setLocalError(result.error);
    }
  };

  const handleStartGame = () => {
    startGame();
  };

  const handleClearErrors = () => {
    setLocalError("");
    clearErrors();
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-700 mb-4">Connecting to server...</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!player.roomId || player.roomId !== roomId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-700 mb-4">{localError || "You're not in this room"}</p>
          <button
            onClick={() => navigate("/lobby")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  const allPlayersReady = room.players.every((p) => p.isReady) && room.players.length > 0;
  const isRoomOwner = player.playerId === room.creatorId;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 bg-white rounded-lg shadow-md">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Room: {room.name || "Unnamed Room"}</h1>
            <p className="text-gray-600 text-sm mt-1">
              Room ID: {room.id}
              {isRoomOwner && " • You are the room owner"}
            </p>
          </div>
          <button
            onClick={handleLeaveRoom}
            disabled={room.isOperating}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {room.isOperating ? "Leaving..." : "Leave Room"}
          </button>
        </div>

        {/* Error Messages */}
        {(localError || room.operationError) && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md flex justify-between items-center">
            <span>{localError || room.operationError}</span>
            <button onClick={handleClearErrors} className="text-red-800 hover:text-red-900 font-bold">
              ×
            </button>
          </div>
        )}

        {/* Loading State */}
        {room.isLoading && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-r-md">
            Loading room data...
          </div>
        )}

        {/* Players Section */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Players ({room.players.length || 0}/{room.settings.maxPlayers})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {room.players.length > 0 ? (
              room.players.map((roomPlayer) => (
                <div
                  key={roomPlayer.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                    roomPlayer.id === player.playerId ? "bg-blue-50 border-blue-500" : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <span className="font-medium text-gray-800">
                    {roomPlayer.name}
                    {roomPlayer.id === player.playerId && <span className="ml-2 text-blue-500">(You)</span>}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      roomPlayer.isReady ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {roomPlayer.isReady ? "Ready" : "Not Ready"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-2 text-center py-8">No players in room</p>
            )}
          </div>
        </div>

        {/* Room Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center p-6 bg-white rounded-lg shadow-md">
          <button
            onClick={handleToggleReady}
            disabled={room.isOperating}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              player.isReady ? "bg-gray-500 text-white hover:bg-gray-600" : "bg-green-500 text-white hover:bg-green-600"
            } disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed`}
          >
            {room.isOperating ? "..." : player.isReady ? "Mark as Not Ready" : "Mark as Ready"}
          </button>

          {/* Start Game Button - Only for room owner */}
          {isRoomOwner && (
            <button
              onClick={handleStartGame}
              disabled={!allPlayersReady || room.isOperating || room.players.length < room.settings.minPlayers}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                allPlayersReady ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-500"
              } disabled:cursor-not-allowed`}
            >
              {room.isOperating ? "Starting..." : "Start Game"}
            </button>
          )}
        </div>

        {/* Status Info */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          {!allPlayersReady && isRoomOwner && "All players must be ready to start the game"}
          {allPlayersReady && isRoomOwner && "Ready to start the game!"}
          {!isRoomOwner && "Waiting for room owner to start the game..."}
        </div>
      </div>
    </div>
  );
}
