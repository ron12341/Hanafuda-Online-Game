import { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { usePlayer } from "../contexts/PlayerContext";
import { useRoom } from "../contexts/RoomContext";
import { useParams, useNavigate } from "react-router-dom";

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { player, setIsReady } = usePlayer();
  const { isConnected, isSocketLoading } = useSocket();
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (player.status === "disconnected") {
      navigate("/", { replace: true });
    }
  }, [player.status]);

  // Join room and fetch data when component mounts or roomId changes
  useEffect(() => {
    if (isSocketLoading) return;
    setIsLoading(true);
    try {
      if (!isConnected || !roomId || !player.roomId) return;
      clearErrors();

      // Fetch room data
      fetchRoomData(roomId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, roomId, player.roomId, navigate]);

  useEffect(() => {
    if (!room || player.roomId !== roomId) return;

    if (room.status === "playing" && player.gameId === room.id) {
      navigate(`/game/${room.id}`);
    }
  }, [room.status]);

  const handleToggleReady = async () => {
    if (!isConnected || !roomId) return;

    const result = await changeReady(!player.isReady);
    if (result.success) {
      setIsReady(result.isReady);
    } else {
      setLocalError(result.error);
    }
  };

  const handleLeaveRoom = async () => {
    setIsLoading(true);
    try {
      console.log("Leaving Room: ", roomId);
      const result = await leaveRoom(roomId);
      if (result.success) {
        navigate("/");
      } else {
        setLocalError(result.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = () => {
    startGame();
  };

  const handleClearErrors = () => {
    setLocalError("");
    clearErrors();
  };

  if (isLoading || isSocketLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isConnected && player.status === "disconnected") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-700">
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-700 mb-4">You are not connected to the server</p>
          <button onClick={() => navigate("/")} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Go to Connection Page
          </button>
        </div>
      </div>
    );
  }

  if (!player.roomId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-700">
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-700 mb-4">{localError || "You're not in a room"}</p>
          <button onClick={() => navigate("/lobby")} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (player.roomId && player.roomId !== roomId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-700">
        <div className="p-6 bg-white rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-700 mb-4">{localError || "You are not in the correct room"}</p>
          <button
            onClick={() => navigate(`/room/${player.roomId}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Go to your room
          </button>
        </div>
      </div>
    );
  }

  const allPlayersReady = room.players.every(p => p.isReady) && room.players.length > 0;
  const isRoomOwner = player.playerId === room.creatorId;

  return (
    <div className="p-4 md:p-6 bg-gray-800">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 bg-gray-700 rounded-lg shadow-md">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Room: {room.name || "Unnamed Room"}</h1>
            <p className="text-gray-200 text-sm mt-1">
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
        {room.isLoading && <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-r-md">Loading room data...</div>}

        {/* Players Section */}
        <div className="mb-8 p-6 bg-gray-700 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-white mb-4">
            Players ({room.players.length || 0}/{room.settings.maxPlayers})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {room.players.length > 0 ? (
              room.players.map(roomPlayer => (
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center p-6 bg-gray-700 rounded-lg shadow-md">
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
              disabled={room.isOperating || !allPlayersReady || room.players.length < room.settings.minPlayers}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                allPlayersReady && room.players.length >= room.settings.minPlayers
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500"
              } disabled:cursor-not-allowed`}
            >
              {room.isOperating ? "Starting..." : "Start Game"}
            </button>
          )}
        </div>

        {/* Status Info */}
        <div className="mt-6 text-center text-gray-200 text-sm">
          {(() => {
            if (room.players.length < room.settings.minPlayers) {
              return "Not enough players to start the game";
            }
            if (!allPlayersReady && isRoomOwner) {
              return "All players must be ready to start the game";
            }
            if (allPlayersReady && isRoomOwner) {
              return "Ready to start the game!";
            }
            if (!isRoomOwner) {
              return "Waiting for room owner to start the game...";
            }
            return null;
          })()}
        </div>
      </div>
    </div>
  );
}
