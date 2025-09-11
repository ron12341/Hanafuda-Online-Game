import { createContext, useContext, useCallback, useEffect, useReducer } from "react";
import { useSocket } from "./SocketContext";
import { usePlayer } from "./PlayerContext";

const GameStateContext = createContext();

const gameReducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_GAME_STATE":
      return {
        ...state,
        id: action.id || state.id,
        roomId: action.roomId || state.roomId,
        players: action.players || state.players,
        currentRound: action.currentRound || state.currentRound,
        table: action.table || state.table,
        currentTurnIndex: action.currentTurnIndex || state.currentTurnIndex,
        myHand: action.myHand || state.myHand,
        error: null,
      };

    case "GAME_OPERATION_START":
      return {
        ...state,
        isOperating: true,
        operationError: null,
      };

    case "GAME_OPERATION_SUCCESS":
      return {
        ...state,
        isOperating: false,
        operationError: null,
        error: null,
      };

    case "GAME_OPERATION_ERROR":
      return {
        ...state,
        isOperating: false,
        operationError: action.error,
      };

    case "REMOVE_CARD_FROM_HAND":
      return {
        ...state,
        myHand: state.myHand.filter((card) => card.id !== action.handCardId),
        isOperating: false,
        operationError: null,
        error: null,
      };

    case "Player_PLAYED_CARD":
      return {
        ...state,
        table: action.table,
        players: action.players,
        isOperating: false,
        operationError: null,
        error: null,
      };

    case "CLEAR_GAME":
      return {
        id: "",
        roomId: "",
        players: [],
        currentRound: 1,
        table: [],
        currentTurnIndex: 0,
        myHand: [],
        error: null,
        isLoading: false,
        operationError: null,
        isOperating: false,
      };

    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, {
    id: "",
    roomId: "",
    players: [],
    currentRound: 1,
    table: [],
    currentTurnIndex: 0,
    myHand: [],
    error: null,
    isLoading: false,
    operationError: null,
    isOperating: false,
  });

  const { emitSafe, socket } = useSocket();
  const { player } = usePlayer();

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleGameState = (gameData) => {
      dispatch({
        type: "UPDATE_GAME_STATE",
        id: gameData.state.id,
        roomId: gameData.state.roomId,
        players: gameData.state.players,
        currentRound: gameData.state.currentRound,
        table: gameData.state.table,
        currentTurnIndex: gameData.state.currentTurnIndex,
        myHand: gameData.state.myHand,
      });

      console.log("Game state updated", state);
    };

    const handlePlayerPlayedCard = (data) => {
      console.log("Player played card", data);
      console.log("Current state", state);
      const updatedTable = state.table.filter((card) => card.id !== data.targetCard.id);
      const updatedPlayers = state.players.map((player) => {
        if (player.id === data.playerId) {
          return {
            ...player,
            captured: [...player.captured, data.handCard, data.targetCard],
          };
        }
        return player;
      });

      console.log("Updated table", updatedTable);
      console.log("Updated players", updatedPlayers);

      dispatch({
        type: "Player_PLAYED_CARD",
        table: updatedTable,
        players: updatedPlayers,
      });
    };

    socket.on("game-state", handleGameState);
    socket.on("player-played-card", handlePlayerPlayedCard);
    return () => {
      socket.off("game-state", handleGameState);
    };
  }, [socket, state]);

  const fetchGameData = useCallback(
    (gameId) => {
      if (!socket) {
        dispatch({ type: "GAME_OPERATION_ERROR", error: "No socket connection" });
        return;
      }
      emitSafe("request-game-state", { gameId });
    },
    [emitSafe, socket]
  );

  const playCard = useCallback(
    (gameId, playerId, cardId, targetCardId) => {
      if (!socket) {
        dispatch({ type: "GAME_OPERATION_ERROR", error: "No socket connection" });
        return;
      }

      dispatch({ type: "GAME_OPERATION_START" });

      return new Promise((resolve) => {
        const handleSuccess = () => {
          cleanupListeners();
          dispatch({
            type: "REMOVE_CARD_FROM_HAND",
            handCardId: cardId,
          });
          dispatch({ type: "GAME_OPERATION_SUCCESS" });
        };

        const handleError = (data) => {
          console.log("Error playing card", data);
          cleanupListeners();
          dispatch({ type: "GAME_OPERATION_ERROR", error: data.error });
          resolve({ success: false, error: data.error });
        };

        const cleanupListeners = () => {
          socket.off("play-card-success", handleSuccess);
          socket.off("play-card-error", handleError);
        };

        socket.once("play-card-success", handleSuccess);
        socket.once("play-card-error", handleError);

        emitSafe("play-card", { gameId, playerId, cardId, targetCardId });
      });
    },
    [emitSafe, socket]
  );

  const value = {
    gameState: {
      ...state,
    },

    fetchGameData,
    playCard,
  };

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
