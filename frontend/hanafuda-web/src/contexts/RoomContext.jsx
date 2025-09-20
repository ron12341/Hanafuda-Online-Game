import { createContext, useContext, useCallback, useEffect, useReducer } from "react";
import { useSocket } from "./SocketContext";
import { usePlayer } from "./PlayerContext";

const RoomStateContext = createContext();

const roomReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_ROOM":
      return {
        ...state,
        id: action.id || state.id,
        name: action.name || state.name,
        players: action.players || state.players,
        creatorId: action.creatorId || state.creatorId,
        settings: action.settings || state.settings,
        status: action.status || state.status,
        error: null, // Clear errors on successful update
      };

    case "ADD_PLAYER":
      return {
        ...state,
        players: [...state.players, action.player],
        error: null, // Clear errors on successful update
      };

    case "PLAYER_LEFT_ROOM":
      return {
        ...state,
        players: state.players.filter(p => p.id !== action.playerId),
        creatorId: action.creatorId,
        error: null,
      };

    case "TRANSFER_CREATOR":
      return {
        ...state,
        creatorId: action.creatorId,
        error: null,
      };

    case "UPDATE_PLAYER_READY":
      return {
        ...state,
        players: state.players.map(player => (player.id === action.playerId ? { ...player, isReady: action.isReady } : player)),
        error: null,
        isOperating: false,
      };

    case "UPDATE_PLAYERS":
      return {
        ...state,
        players: action.players || [],
        error: null, // Clear errors on successful update
      };

    case "GAME_STARTED":
      return {
        ...state,
        status: "playing",
        error: null, // Clear errors on successful update
      };

    case "ROOM_OPERATION_START":
      return {
        ...state,
        isOperating: true,
        operationError: null,
      };

    case "ROOM_OPERATION_SUCCESS":
      return {
        ...state,
        isOperating: false,
        operationError: null,
      };

    case "ROOM_OPERATION_ERROR":
      return {
        ...state,
        isOperating: false,
        operationError: action.error,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.isLoading,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
      };

    case "CLEAR_ERRORS":
      return {
        ...state,
        error: null,
        operationError: null,
      };

    case "CLEAR_ROOM":
      return {
        id: "",
        players: [],
        name: "",
        isLoading: false,
        isOperating: false,
        error: null,
        operationError: null,
        creatorId: "",
        settings: { maxPlayers: 4, totalRounds: 3, visibility: "public", minPlayers: 3 },
      };

    default:
      return state;
  }
};

export const RoomProvider = ({ children }) => {
  const [state, dispatch] = useReducer(roomReducer, {
    id: "",
    players: [],
    name: "",
    creatorId: "",
    settings: { maxPlayers: 4, totalRounds: 3, visibility: "public", minPlayers: 3 },
    status: "waiting",
    isLoading: false,
    isOperating: false,
    error: null,
    operationError: null,
  });

  const { emitSafe, socket } = useSocket();
  const { playerId, setRoomId, setGameId, setIsReady } = usePlayer();

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleRoomState = roomData => {
      dispatch({
        type: "UPDATE_ROOM",
        id: roomData.id,
        name: roomData.name,
        players: roomData.players,
        creatorId: roomData.creatorId,
        settings: roomData.settings,
        status: roomData.status,
      });
    };

    const handleRoomPlayersUpdate = playersData => {
      dispatch({
        type: "UPDATE_PLAYERS",
        players: playersData.players,
      });
    };

    const handleRoomOperationError = errorData => {
      console.error("Room operation error", errorData);
      dispatch({ type: "ROOM_OPERATION_ERROR", error: errorData.error });
    };

    const handlePlayerJoined = playerData => {
      dispatch({
        type: "ADD_PLAYER",
        player: playerData,
      });
    };

    const handlePlayerLeft = data => {
      dispatch({
        type: "PLAYER_LEFT_ROOM",
        playerId: data.playerId,
        creatorId: data.creatorId,
      });
    };

    const handlePlayerReady = readyData => {
      dispatch({
        type: "UPDATE_PLAYER_READY",
        playerId: readyData.playerId,
        isReady: readyData.isReady,
      });
    };

    const handleGameStarted = gameData => {
      setGameId(gameData.gameId);
      dispatch({
        type: "GAME_STARTED",
      });
    };

    socket.on("room-state", handleRoomState);
    socket.on("room-players-update", handleRoomPlayersUpdate);
    socket.on("room-state-error", handleRoomOperationError);
    socket.on("player-joined-room", handlePlayerJoined);
    socket.on("player-left-room", handlePlayerLeft);
    socket.on("player-ready-changed", handlePlayerReady);

    socket.on("game-started", handleGameStarted);

    return () => {
      socket.off("room-state", handleRoomState);
      socket.off("room-players-update", handleRoomPlayersUpdate);
      socket.off("room-state-error", handleRoomOperationError);
      socket.off("player-joined-room", handlePlayerJoined);
      socket.off("player-left-room", handlePlayerLeft);
      socket.off("player-ready-changed", handlePlayerReady);
      socket.off("game-started", handleGameStarted);
    };
  }, [socket, state]);

  const fetchRoomData = useCallback(
    roomId => {
      if (!socket) {
        dispatch({ type: "ROOM_OPERATION_ERROR", error: "Not connected to server" });
        return;
      }
      emitSafe("request-room-state", { playerId: playerId, roomId });
    },
    [emitSafe, socket, playerId]
  );

  const leaveRoom = useCallback(
    roomId => {
      if (!socket) {
        dispatch({ type: "ROOM_OPERATION_ERROR", error: "Not connected to server" });
        return;
      }

      dispatch({ type: "ROOM_OPERATION_START" });

      return new Promise(resolve => {
        const handleSucess = () => {
          cleanupListeners();
          setRoomId("");
          setIsReady(false);
          dispatch({ type: "CLEAR_ROOM" });
          resolve({ success: true });
        };

        const handleError = data => {
          cleanupListeners();
          dispatch({ type: "ROOM_OPERATION_ERROR", error: data.error });
          resolve({ success: false, error: data.error });
        };

        const cleanupListeners = () => {
          socket.off("leave-room-success", handleSucess);
          socket.off("leave-room-error", handleError);
        };

        socket.once("leave-room-success", handleSucess);
        socket.once("leave-room-error", handleError);
        socket.emit("leave-room", { playerId: playerId, roomId: roomId });
      });
    },
    [emitSafe, socket]
  );

  const changeReady = useCallback(
    isReady => {
      if (!socket) {
        dispatch({ type: "ROOM_OPERATION_ERROR", error: "Not connected to server" });
        return;
      }

      dispatch({ type: "ROOM_OPERATION_START" });

      return new Promise(resolve => {
        const handleSucess = data => {
          cleanupListeners();
          dispatch({ type: "UPDATE_PLAYER_READY", playerId: data.playerId, isReady: data.isReady });
          resolve({ success: true, isReady: data.isReady });
        };

        const handleError = data => {
          cleanupListeners();
          dispatch({ type: "ROOM_OPERATION_ERROR", error: data.error });
          resolve({ success: false, error: data.error });
        };

        const cleanupListeners = () => {
          socket.off("ready-change-success", handleSucess);
          socket.off("ready-change-error", handleError);
        };

        socket.once("ready-change-success", handleSucess);
        socket.once("ready-change-error", handleError);

        emitSafe("ready-change", { isReady: isReady });
      });
    },
    [emitSafe, socket]
  );

  const startGame = useCallback(() => {
    if (!socket) {
      dispatch({ type: "ROOM_OPERATION_ERROR", error: "Not connected to server" });
      return;
    }

    dispatch({ type: "ROOM_OPERATION_START" });

    return new Promise(resolve => {
      const handleError = data => {
        cleanupListeners();
        dispatch({ type: "ROOM_OPERATION_ERROR", error: data.error });
        resolve({ success: false, error: data.error });
      };

      const cleanupListeners = () => {
        socket.off("start-game-error", handleError);
      };

      socket.once("start-game-error", handleError);
      emitSafe("start-game");
    });
  }, [emitSafe, socket]);

  const clearErrors = useCallback(() => {
    dispatch({ type: "CLEAR_ERRORS" });
  }, []);

  const clearRoom = useCallback(() => {
    dispatch({ type: "CLEAR_ROOM" });
    setRoomId("");
    setIsReady(false);
  }, [dispatch, setRoomId]);

  const value = {
    room: {
      ...state,
    },

    fetchRoomData,
    leaveRoom,
    clearErrors,
    changeReady,
    startGame,
    clearRoom,
  };

  return <RoomStateContext.Provider value={value}>{children}</RoomStateContext.Provider>;
};

export const useRoom = () => {
  const context = useContext(RoomStateContext);
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};
