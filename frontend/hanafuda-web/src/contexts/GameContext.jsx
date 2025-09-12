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
        flippedCard: action.flippedCard || state.flippedCard,
        deckSize: action.deckSize || state.deckSize,
        isOperating: false,
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
        myHand: state.myHand.filter(card => card.id !== action.handCardId),
        isOperating: false,
        operationError: null,
        error: null,
      };

    case "PLAYER_CAPTURED_CARD":
      console.log("CAPTURING CARD", action);
      const updatedTable = state.table.filter(card => card.id !== action.targetCard.id);
      const updatedPlayers = state.players.map(player => {
        if (player.id === action.playerId) {
          return {
            ...player,
            captured: [...player.captured, action.handCard, action.targetCard],
          };
        }
        return player;
      });

      return {
        ...state,
        table: updatedTable,
        players: updatedPlayers,
        flippedCard: action.flippedCard,
        isOperating: false,
        operationError: null,
        error: null,
      };

    case "PLAYER_DISCARDED_CARD":
      console.log("DISCARDING CARD", action);
      return {
        ...state,
        table: [...state.table, action.handCard],
        flippedCard: action.flippedCard,
        isOperating: false,
        operationError: null,
        error: null,
      };

    case "PLAYER_CAPTURED_FLIPPED_CARD":
      console.log("CAPTURING FLIPPED CARD", action);
      const targetCard = state.table.find(card => card.id === action.targetCardId);
      return {
        ...state,
        table: state.table.filter(card => card.id !== action.targetCardId),
        players: state.players.map(player => {
          if (player.id === action.playerId) {
            return {
              ...player,
              captured: [...player.captured, targetCard, action.flippedCard],
            };
          }
          return player;
        }),
        currentTurnIndex: action.currentTurnIndex,
        flippedCard: undefined,
        isOperating: false,
        operationError: null,
        error: null,
      };

    case "PLAYER_DISCARDED_FLIPPED_CARD":
      console.log("DISCARDING FLIPPED CARD", action);
      return {
        ...state,
        table: [...state.table, action.flippedCard],
        currentTurnIndex: action.currentTurnIndex,
        flippedCard: undefined,
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
        flippedCard: null,
        deckSize: 0,
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
    flippedCard: null,
    deckSize: 0,
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

    const handlePlayerPlayedCard = data => {
      console.log("Player played card", data);
      console.log("Current state", state);

      if (data.action === "capture") {
        dispatch({
          type: "PLAYER_CAPTURED_CARD",
          playerId: data.playerId,
          handCard: data.handCard,
          targetCard: data.targetCard,
          flippedCard: data.flippedCard,
        });
      } else if (data.action === "discard") {
        dispatch({
          type: "PLAYER_DISCARDED_CARD",
          handCard: data.handCard,
          flippedCard: data.flippedCard,
        });
      }
    };

    const handlePlayerPlayedFlippedCard = data => {
      console.log("Player played flipped card", data);

      if (data.action === "capture") {
        dispatch({
          type: "PLAYER_CAPTURED_FLIPPED_CARD",
          playerId: data.playerId,
          targetCardId: data.targetCardId,
          currentTurnIndex: data.currentTurnIndex,
          flippedCard: state.flippedCard,
        });
      } else if (data.action === "discard") {
        dispatch({
          type: "PLAYER_DISCARDED_FLIPPED_CARD",
          currentTurnIndex: data.currentTurnIndex,
          flippedCard: state.flippedCard,
        });
      }
    };

    socket.on("player-played-card", handlePlayerPlayedCard);
    socket.on("player-played-flipped-card", handlePlayerPlayedFlippedCard);
    return () => {
      socket.off("player-played-card", handlePlayerPlayedCard);
      socket.off("player-played-flipped-card", handlePlayerPlayedFlippedCard);
    };
  }, [socket, state]);

  const fetchGameData = useCallback(
    gameId => {
      if (!socket) {
        dispatch({ type: "GAME_OPERATION_ERROR", error: "No socket connection" });
        return;
      }

      return new Promise(resolve => {
        const handleSuccess = gameData => {
          console.log("Fetched game data", gameData);
          cleanupListeners();
          dispatch({
            type: "UPDATE_GAME_STATE",
            id: gameData.state.id,
            roomId: gameData.state.roomId,
            players: gameData.state.players,
            currentRound: gameData.state.currentRound,
            table: gameData.state.table,
            currentTurnIndex: gameData.state.currentTurnIndex,
            myHand: gameData.state.myHand,
            flippedCard: gameData.state.flippedCard,
            deckSize: gameData.state.deckSize,
          });
          resolve({ success: true, data: gameData.state });
        };

        const handleError = data => {
          console.log("Error fetching game data", data);
          cleanupListeners();
          resolve({ success: false, error: data.error });
        };

        const cleanupListeners = () => {
          socket.off("game-state", handleSuccess);
          socket.off("game-state-error", handleError);
        };

        socket.on("game-state", handleSuccess);
        socket.on("game-state-error", handleError);

        emitSafe("request-game-state", { gameId: gameId });
      });
    },
    [emitSafe, socket]
  );

  const playCard = useCallback(
    ({ gameId, playerId, cardId, targetCardId, action, cardType }) => {
      console.log("PLAYING CARD", { gameId, playerId, cardId, targetCardId, action, cardType });

      if (!socket) {
        dispatch({ type: "GAME_OPERATION_ERROR", error: "No socket connection" });
        return;
      }

      dispatch({ type: "GAME_OPERATION_START" });

      return new Promise(resolve => {
        const handleSuccess = () => {
          cleanupListeners();
          dispatch({
            type: "REMOVE_CARD_FROM_HAND",
            handCardId: cardId,
          });
          dispatch({ type: "GAME_OPERATION_SUCCESS" });
          resolve({ success: true, flippedCard: state.flippedCard });
        };

        const handleError = data => {
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

        if (action === "capture") {
          emitSafe("play-card", { gameId, playerId, cardId, targetCardId, action, cardType });
        } else if (action === "discard") {
          emitSafe("play-card", { gameId, playerId, cardId, action, cardType });
        }
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
