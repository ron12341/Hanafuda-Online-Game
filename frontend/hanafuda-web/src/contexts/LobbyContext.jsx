import { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";
import { usePlayer } from "../contexts/PlayerContext";

const LobbyStateContext = createContext();

// Simplified reducer - WebSocket is event-driven, not request/response
const lobbyReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_LOBBY":
      return {
        ...state,
        rooms: action.rooms || [],
        waitingPlayers: action.waitingPlayers || [],
        error: null, // Clear errors on successful update
      };
    case "UPDATE_ROOMS":
      return {
        ...state,
        rooms: action.rooms || [],
        error: null, // Clear errors on successful update
      };

    case "UPDATE_WAITING_PLAYERS":
      return {
        ...state,
        waitingPlayers: action.waitingPlayers || [],
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

    case "CLEAR_ERRORS":
      return {
        ...state,
        error: null,
        operationError: null,
      };

    case "CLEAR_LOBBY":
      return {
        rooms: [],
        waitingPlayers: [],
        isOperating: false,
        error: null,
        operationError: null,
      };

    default:
      return state;
  }
};

export const LobbyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(lobbyReducer, {
    rooms: [],
    waitingPlayers: [],
    isOperating: false, // Single loading state for all operations
    error: null,
    operationError: null,
  });

  const { emitSafe, socket, isConnected } = useSocket();
  const { setRoomId } = usePlayer();

  const handleLobbyState = (lobbyData) => {
    console.log("Updating lobby state", lobbyData);
    dispatch({
      type: "UPDATE_LOBBY",
      rooms: lobbyData.rooms,
      waitingPlayers: lobbyData.waitingPlayers,
    });
  };

  const handleUpdateRooms = (lobbyData) => {
    dispatch({ type: "UPDATE_ROOMS", rooms: lobbyData.rooms });
  };

  const handleUpdateWaitingPlayers = (lobbyData) => {
    dispatch({ type: "UPDATE_WAITING_PLAYERS", waitingPlayers: lobbyData.waitingPlayers });
  };

  // Socket event listeners - much simpler
  useEffect(() => {
    if (!socket) return;

    const handleRoomOperationError = (errorData) => {
      dispatch({ type: "ROOM_OPERATION_ERROR", error: errorData.error });
    };

    socket.on("lobby-state", handleLobbyState);
    socket.on("room-operation-error", handleRoomOperationError);
    socket.on("lobby-update-rooms", handleUpdateRooms);
    socket.on("lobby-update-waiting-players", handleUpdateWaitingPlayers);

    return () => {
      socket.off("lobby-state", handleLobbyState);
      socket.off("room-operation-error", handleRoomOperationError);
      socket.off("lobby-update-rooms", handleUpdateRooms);
      socket.off("lobby-update-waiting-players", handleUpdateWaitingPlayers);
    };
  }, [socket]);

  // Fetch lobby data - simplified
  const fetchLobbyData = useCallback(() => {
    if (!socket) {
      dispatch({ type: "ROOM_OPERATION_ERROR", error: "Not connected to server" });
      return;
    }
    emitSafe("request-lobby-state");
  }, [emitSafe, socket]);

  const createRoom = useCallback(
    async (roomName, settings) => {
      if (!socket) {
        return { success: false, error: "Not connected to server" };
      }

      dispatch({ type: "ROOM_OPERATION_START" });

      return new Promise((resolve) => {
        emitSafe("create-room", { roomName, settings }, (response) => {
          if (response.success) {
            setRoomId(response.roomId);
            dispatch({ type: "ROOM_OPERATION_SUCCESS" });
            resolve({ success: true, roomId: response.roomId });
          } else {
            dispatch({ type: "ROOM_OPERATION_ERROR", error: response.error });
            resolve({ success: false, error: response.error });
          }
        });
      });
    },
    [emitSafe, socket, setRoomId]
  );

  const joinRoom = useCallback(
    async (roomId) => {
      if (!socket) {
        return { success: false, error: "Not connected to server" };
      }

      dispatch({ type: "ROOM_OPERATION_START" });

      return new Promise((resolve) => {
        const handleSuccess = (data) => {
          socket.off("join-room-sucess", handleSuccess);
          socket.off("join-room-error", handleError);

          setRoomId(data.roomId);
          dispatch({ type: "ROOM_OPERATION_SUCCESS" });
          resolve({ success: true, roomId: data.roomId });
        };

        const handleError = (data) => {
          socket.off("join-room-sucess", handleSuccess);
          socket.off("join-room-error", handleError);

          dispatch({ type: "ROOM_OPERATION_ERROR", error: data.error });
          resolve({ success: false, error: data.error });
        };

        socket.once("join-room-success", handleSuccess);
        socket.once("join-room-error", handleError);

        emitSafe("join-room", { roomId });

        setTimeout(() => {
          socket.off("join-room-success", handleSuccess);
          socket.off("join-room-error", handleError);

          dispatch({ type: "ROOM_OPERATION_ERROR", error: "Request timeout" });
          resolve({ success: false, error: "Request timeout", roomId });
        }, 5000);
      });
    },
    [emitSafe, socket, setRoomId]
  );

  const leaveLobby = useCallback(() => {
    emitSafe("lobby-leave");
    dispatch({ type: "CLEAR_LOBBY" });
  }, [emitSafe]);

  const clearErrors = useCallback(() => {
    dispatch({ type: "CLEAR_ERRORS" });
  }, []);

  const value = {
    ...state,
    fetchLobbyData,
    createRoom,
    joinRoom,
    leaveLobby,
    clearErrors,
  };

  return <LobbyStateContext.Provider value={value}>{children}</LobbyStateContext.Provider>;
};

export const useLobby = () => {
  const context = useContext(LobbyStateContext);
  if (!context) {
    throw new Error("useLobby must be used within a LobbyProvider");
  }
  return context;
};
