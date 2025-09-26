import { createContext, useContext, useCallback, useEffect, useReducer, useRef, useState, use } from "react";
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
        settings: action.settings || state.settings,
        gameScores: action.gameScores || state.gameScores,
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
        deckSize: action.deckSize,
        isOperating: false,
        operationError: null,
        error: null,
      };

    case "PLAYER_DISCARDED_CARD":
      return {
        ...state,
        table: [...state.table, action.handCard],
        flippedCard: action.flippedCard,
        deckSize: action.deckSize,
        isOperating: false,
        operationError: null,
        error: null,
      };

    case "PLAYER_CAPTURED_FLIPPED_CARD":
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
      return {
        ...state,
        table: [...state.table, action.flippedCard],
        currentTurnIndex: action.currentTurnIndex,
        flippedCard: undefined,
        isOperating: false,
        operationError: null,
        error: null,
      };

    case "ROUND_OVER": {
      // action: { type, roundResult: { playerId, username, score }[] }
      const roundResults = action.roundResult;

      // Convert array to map for O(1) lookups
      const resultMap = new Map();
      roundResults.forEach(result => {
        resultMap.set(result.playerId, result);
      });

      // Update players
      const updatedPlayers = state.players.map(player => {
        const roundResult = resultMap.get(player.id);

        if (roundResult) {
          return {
            ...player,
            score: player.score + roundResult.score,
            captured: [],
          };
        }
        return player;
      });

      const updatedgameScores = [...state.gameScores, { round: state.currentRound, roundScores: roundResults }];

      return {
        ...state,
        roundResult: action.roundResult,
        gameScores: updatedgameScores,
        players: updatedPlayers,
        isOperating: false,
        operationError: null,
        error: null,
      };
    }

    case "SHOW_ROUND_TRANSITION":
      return {
        ...state,
        showRoundTransition: true,
        transitionDuration: action.duration,
        transitionMessage: action.message,
      };

    case "NEW_ROUND_STARTED":
      return {
        ...state,
        table: action.table,
        myHand: action.myHand,
        deckSize: action.deckSize,
        currentRound: action.currentRound,
        currentTurnIndex: action.currentTurnIndex,
        showRoundTransition: false,
        flippedCard: null,
        isOperating: false,
        operationError: null,
        error: null,
      };

    case "GAME_OVER":
      return {
        ...state,
        isGameOver: true,
        winner: action.winner,
        finalScores: action.finalScores,
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

        // Round OVer Notification state
        roundResult: [],
        showRoundTransition: false,
        transitionDuration: 0,
        transitionMessage: "",

        // Game Over Notification state
        isGameOver: false,
        finalScores: {},
        winner: null,
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
    settings: {},
    gameScores: [],
    error: null,
    isLoading: false,
    operationError: null,
    isOperating: false,

    // Round OVer Notification state
    roundResult: [],
    showRoundTransition: false,
    transitionDuration: 0,
    transitionMessage: "",

    // Game Over Notification state
    isGameOver: false,
    finalScores: {},
    winner: null,
  });

  const { emitSafe, socket } = useSocket();
  const { player } = usePlayer();

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handlePlayerPlayedCard = data => {
      if (data.action === "capture") {
        dispatch({
          type: "PLAYER_CAPTURED_CARD",
          playerId: data.playerId,
          handCard: data.handCard,
          targetCard: data.targetCard,
          flippedCard: data.flippedCard,
          deckSize: state.deckSize - 1,
        });
      } else if (data.action === "discard") {
        dispatch({
          type: "PLAYER_DISCARDED_CARD",
          handCard: data.handCard,
          flippedCard: data.flippedCard,
          deckSize: state.deckSize - 1,
        });
      }
    };

    const handlePlayerPlayedFlippedCard = data => {
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

    // In your game context
    const handleRoundTransition = data => {
      console.log("Round transition:", data);
      dispatch({
        type: "ROUND_OVER",
        roundResult: data.roundResult,
      });

      dispatch({
        type: "SHOW_ROUND_TRANSITION",
        duration: 5,
        message: "Round ended - Starting new round in...",
      });

      setTimeout(() => {
        dispatch({
          type: "NEW_ROUND_STARTED",
          table: data.nextRound.table,
          myHand: data.nextRound.myHand,
          deckSize: data.nextRound.deckSize,
          currentTurnIndex: data.nextRound.currentTurnIndex,
          currentRound: state.currentRound + 1,
        });
      }, 5000);
    };

    const handleGameOver = data => {
      dispatch({ type: "GAME_OVER", winner: data.winner, finalScores: data.finalScores });
    };

    socket.on("player-played-card", handlePlayerPlayedCard);
    socket.on("player-played-flipped-card", handlePlayerPlayedFlippedCard);
    socket.on("round-transition", handleRoundTransition);
    socket.on("game-over", handleGameOver);
    return () => {
      socket.off("player-played-card", handlePlayerPlayedCard);
      socket.off("player-played-flipped-card", handlePlayerPlayedFlippedCard);
      socket.off("round-transition", handleRoundTransition);
      socket.off("game-over", handleGameOver);
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
          console.log("Received game data:", gameData);
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
            settings: gameData.state.settings,
            gameScores: gameData.state.gameScores,
          });
          resolve({ success: true, data: gameData.state });
        };

        const handleError = data => {
          cleanupListeners();
          resolve({ success: false, error: data.error });
        };

        const cleanupListeners = () => {
          socket.off("game-state", handleSuccess);
          socket.off("game-state-error", handleError);
        };

        socket.on("game-state", handleSuccess);
        socket.on("game-state-error", handleError);

        console.log("Fetching game state...");
        emitSafe("request-game-state", { gameId: gameId });
      });
    },
    [emitSafe, socket]
  );

  const playCard = useCallback(
    ({ gameId, playerId, cardId, targetCardId, action, cardType }) => {
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

  const clearGame = useCallback(() => {
    dispatch({ type: "CLEAR_GAME" });
    player.setGameId(null);
  }, [dispatch, player]);

  const value = {
    ...state,

    gameState: {
      ...state,
    },

    fetchGameData,
    playCard,
    clearGame,
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
