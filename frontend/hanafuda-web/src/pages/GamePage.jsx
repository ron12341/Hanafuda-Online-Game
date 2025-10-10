import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { usePlayer } from "../contexts/PlayerContext";
import { useGame } from "../contexts/GameContext";
import { useRoom } from "../contexts/RoomContext";

import Card from "./components/Card";
import RoundTransitionModal from "./components/RoundTransitionModal";
import GameOverModal from "./components/GameOverModal";
import CapturedCardsModal from "./components/CapturedCardsModal";
import PlayerScoresModal from "./components/PlayerScoresModal";

import { getCardSize, getHandCardSize } from "../utils/calculateCardSize";

export default function GamePage() {
  const { gameId } = useParams();
  const { isConnected, isSocketLoading } = useSocket();
  const { player } = usePlayer();
  const { gameState, fetchGameData, playCard, clearGame, leaveGame } = useGame();
  const { clearRoom } = useRoom();
  const [myTurn, setMyTurn] = useState(false);

  const [selectedHandCard, setSelectedHandCard] = useState(null);
  const [filteredTableCards, setFilteredTableCards] = useState([]);
  const [cardSize, setCardSize] = useState(getCardSize());
  const [handCardSize, setHandCardSize] = useState("medium");

  const [showScoresModal, setShowScoresModal] = useState(false);
  const [showCapturedModal, setShowCapturedModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Check if flipped card should be automatically selected
  const shouldAutoSelectFlippedCard = gameState.flippedCard && myTurn;
  const handCardsDisabled = shouldAutoSelectFlippedCard;

  useEffect(() => {
    if (shouldAutoSelectFlippedCard) {
      setSelectedHandCard(gameState.flippedCard);
    }
  }, [shouldAutoSelectFlippedCard, gameState.flippedCard]);

  const isSameMonth = (card1, card2) => {
    return card1.month === card2.month || card1.id === "11-kasu" || card2.id === "11-kasu";
  };

  const handleSelectHandCard = handCard => {
    if (handCardsDisabled && myTurn) return; // Prevent selection when hand is disabled

    if (handCard === selectedHandCard) {
      setSelectedHandCard(null);
    } else {
      setSelectedHandCard(handCard);
    }
  };

  const handleShowCapturedCards = player => {
    setSelectedPlayer(player);
    setShowCapturedModal(true);
  };

  const handleCaptureCard = async targetCard => {
    if (!myTurn) return;
    if (isSameMonth(selectedHandCard, targetCard)) {
      let result;
      if (!gameState?.flippedCard) {
        result = await playCard({
          gameId: gameState.id,
          playerId: player.playerId,
          cardId: selectedHandCard.id,
          targetCardId: targetCard.id,
          action: "capture",
          cardType: "hand",
        });
      } else {
        result = await playCard({
          gameId: gameState.id,
          playerId: player.playerId,
          cardId: selectedHandCard.id,
          targetCardId: targetCard.id,
          action: "capture",
          cardType: "flipped",
        });
      }

      if (!result.success) {
        {
          cardSize;
        }
        setError(result.error);
      }

      setSelectedHandCard(null);
    }
  };

  const handleDiscardCard = async card => {
    if (!myTurn) return;
    if (filteredTableCards.length > 0) return; // cannot discard if there are filtered table cards

    let result;
    if (!gameState?.flippedCard) {
      result = await playCard({ gameId: gameState.id, playerId: player.playerId, cardId: selectedHandCard.id, action: "discard", cardType: "hand" });
    } else {
      result = await playCard({
        gameId: gameState.id,
        playerId: player.playerId,
        cardId: selectedHandCard.id,
        action: "discard",
        cardType: "flipped",
      });
    }

    if (!result.success) {
      setError(result.error);
    }

    setSelectedHandCard(null);
  };

  const handleExitGame = () => {
    clearGame();
    clearRoom();

    // Navigate to a different route entirely to avoid the fetch
    setTimeout(() => navigate("/lobby"), 100);
  };

  useEffect(() => {
    const filterTableCards = () => {
      if (!selectedHandCard) {
        setFilteredTableCards([]);
        return;
      }
      setFilteredTableCards(gameState.table.filter(card => isSameMonth(card, selectedHandCard)));
    };

    filterTableCards();
  }, [selectedHandCard]);

  useEffect(() => {
    if (player.status === "disconnected") {
      console.log("Redirecting to login page");
      navigate("/", { replace: true });
      return;
    }
    if (!isConnected || !gameId || isSocketLoading || player.status === "connecting") return;

    if (player.gameId && player.gameId !== gameId) {
      console.log("Redirecting to game page: ", player.gameId);
      navigate(`/game/${player.gameId}`, { replace: true });
      return;
    } else if (!player.gameId && player.roomId) {
      console.log("Redirecting to room page: ", player.roomId);
      navigate(`/room/${player.roomId}`, { replace: true });
      return;
    } else if (!player.gameId && !player.roomId) {
      console.log("Redirecting to lobby page");
      navigate("/lobby", { replace: true });
      return;
    }

    try {
      setIsLoading(true);
      const loadGame = async () => {
        try {
          const result = await fetchGameData(gameId);

          if (result.success) {
            const data = result.data;
            setMyTurn(data.players?.[data.currentTurnIndex]?.id === player.playerId);
          } else {
            console.log("Failed to load game:", result.error);
          }
        } catch (err) {
          setError("Failed to load game");
          console.error("Game load error:", err);
        }
      };

      if (isConnected && gameId) {
        loadGame();
      }
    } catch (err) {
      setError("Failed to load game");
      console.error("Game load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, gameId]);

  useEffect(() => {
    if (!player || !gameState) return;

    setMyTurn(isMyTurn());
  }, [gameState?.currentTurnIndex, player?.id]);

  useEffect(() => {
    if (gameState?.myHand) {
      const newSize = getHandCardSize(gameState.myHand.length);
      setHandCardSize(newSize);
    }
  }, [gameState?.myHand]);

  useEffect(() => {
    if (!gameState) return;

    const handleResize = () => {
      setCardSize(getCardSize());
      setHandCardSize(getHandCardSize(gameState.myHand.length));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [window.innerWidth, gameState.myHand]);

  const handleLeaveGame = async () => {
    try {
      const result = await leaveGame({ playerId: player.playerId, gameId: gameState.id });

      if (result.success) {
        console.log("Successfully left the game");
        handleExitGame();
      } else {
        console.log("Failed to leave the game");
        console.log(result.error);
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const isMyTurn = () => {
    return gameState.players?.[gameState.currentTurnIndex]?.id === player.playerId;
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

  return (
    <div className="w-full h-screen bg-gray-800 text-white p-1 sm:p-2 md:p-3 flex flex-col justify-between overflow-hidden gap-1">
      {/* Top Section */}
      <div className="bg-black bg-opacity-70 rounded-lg p-2 sm:p-3 md:p-4 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 md:gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-4 text-center sm:text-left min-w-0 flex-shrink">
          <p className="text-yellow-300 text-xs sm:text-sm md:text-base lg:text-lg truncate">
            {gameState.players[gameState.currentTurnIndex]?.name ?? "Unknown"}'s Turn
          </p>
          <p className="text-blue-300 text-xs sm:text-sm md:text-base lg:text-lg">Round: {gameState.currentRound}</p>
          {handCardsDisabled && (
            <p className="text-red-300 text-xs sm:text-sm md:text-base animate-pulse hidden xs:inline">⚠️ Play flipped card first</p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 p-1 sm:p-2">
          <button
            className="bg-green-600 hover:bg-green-700 px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-3 rounded-lg text-xs sm:text-sm md:text-base transition-colors"
            onClick={() => setShowScoresModal(true)}
          >
            Scores
          </button>
          <button
            className="bg-purple-600 hover:bg-purple-700 px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-3 rounded-lg text-xs sm:text-sm md:text-base"
            onClick={() => window.open("/combos", "_blank")}
          >
            Combos
          </button>
          <button
            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-3 rounded-lg text-xs sm:text-sm md:text-base"
            onClick={() => window.open("/cards-library", "_blank")}
          >
            Library
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-3 rounded-lg text-xs sm:text-sm md:text-base"
            onClick={handleLeaveGame}
          >
            Leave
          </button>
        </div>
      </div>

      {/* Players' Captured Cards */}
      <div className="bg-black bg-opacity-50 rounded-lg p-2 sm:p-3 md:p-4 flex justify-center sm:justify-around items-center gap-2 sm:gap-3 md:gap-4 overflow-x-auto min-h-[50px] sm:min-h-[60px] md:min-h-[70px]">
        {gameState.players.map(gamePlayer => (
          <div
            key={gamePlayer.id}
            className={`px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 text-center rounded-lg border-2 cursor-pointer text-xs sm:text-sm md:text-base min-w-[85px] sm:min-w-[110px] md:min-w-[130px] ${
              gamePlayer.id === player.playerId
                ? "bg-blue-700 border-blue-500 hover:border-yellow-300"
                : "bg-gray-800 border-gray-600 hover:border-yellow-400"
            }`}
            onClick={() => handleShowCapturedCards(gamePlayer)}
          >
            <div className="font-semibold truncate text-xs sm:text-sm md:text-base">{gamePlayer.name}</div>
            <div className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">Cards: {gamePlayer.captured.length}</div>
          </div>
        ))}
      </div>
      {/* Game Board */}
      <div className="flex-1 flex flex-col lg:flex-row gap-1 sm:gap-2 items-stretch justify-center min-h-0">
        {/* Flipped & Deck */}
        <div className="bg-black bg-opacity-30 rounded-lg p-1 sm:p-2 flex items-center justify-evenly min-w-[200px] sm:min-w-[250px] lg:min-w-[280px]">
          <div className="text-center">
            <h3 className="text-yellow-300 font-semibold text-xs sm:text-sm mb-1">Flipped Card</h3>
            {gameState.flippedCard ? (
              <Card
                card={gameState.flippedCard}
                selected={selectedHandCard?.id === gameState.flippedCard.id}
                size={cardSize}
                src={gameState.flippedCard.image}
                alt={gameState.flippedCard.name}
                cardType="flipped"
                handCardsDisabled={handCardsDisabled}
              />
            ) : (
              <Card card={undefined} size={cardSize} cardType="flipped" />
            )}
          </div>

          <div className="text-center">
            <h2 className="text-yellow-200 font-semibold text-xs sm:text-sm mb-1">Deck</h2>
            <div className="w-12 sm:w-16 h-16 sm:h-20 rounded-lg bg-gray-800 shadow-lg flex items-center justify-center">
              <span className="text-sm sm:text-base">{gameState.deckSize}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-black bg-opacity-30 rounded-lg p-1 sm:p-2 overflow-auto min-h-0">
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 min-h-full content-center">
            {gameState.table?.map(
              card =>
                card && (
                  <Card
                    key={card.id}
                    card={card}
                    onClick={() => handleCaptureCard(card)}
                    selected={selectedHandCard?.id === card.id}
                    size={cardSize}
                    src={card.image}
                    alt={card.name}
                    isDisabled={selectedHandCard && !isSameMonth(selectedHandCard, card)}
                    isSelectable={!!selectedHandCard}
                    cardType="table"
                  />
                )
            )}
          </div>
        </div>
      </div>

      {/* Player Hand */}
      <div className="bg-black bg-opacity-70 rounded-lg pt-3 pb-3 flex flex-col items-center">
        <h2 className="text-green-300 font-semibold text-xs mb-1">
          {myTurn ? (
            <>
              Your Turn
              {handCardsDisabled && <span className="text-red-300 ml-1">(Play flipped card)</span>}
            </>
          ) : (
            "Waiting..."
          )}
        </h2>

        <div className="flex flex-wrap justify-center gap-1 max-h-32 sm:max-h-40">
          {gameState.myHand?.map(card => (
            <Card
              key={card.id}
              card={card}
              onClick={() => handleSelectHandCard(card)}
              selected={selectedHandCard?.id === card.id}
              size={handCardSize}
              src={card.image}
              alt={card.name}
              cardType="hand"
              isDisabled={handCardsDisabled}
            />
          ))}
        </div>
      </div>

      {/* Discard Button */}
      {selectedHandCard && filteredTableCards.length <= 0 && myTurn && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={() => handleDiscardCard(selectedHandCard)}
            className="px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg sm:rounded-xl shadow-lg transition-all text-xs sm:text-sm md:text-base lg:text-lg"
          >
            📤 Discard
          </button>
        </div>
      )}

      {/* Modals */}
      {gameState.showRoundTransition && <RoundTransitionModal duration={5} roundResult={gameState.roundResult} />}

      <GameOverModal isGameOver={gameState.isGameOver} winner={gameState.winner} scores={gameState.finalScores} onExit={handleExitGame} />

      {showCapturedModal && selectedPlayer && (
        <CapturedCardsModal
          isOpen={showCapturedModal}
          onClose={() => {
            setShowCapturedModal(false);
            setSelectedPlayer(null);
          }}
          playerUsername={selectedPlayer?.name || ""}
          capturedCards={selectedPlayer?.captured || []}
        />
      )}

      {showScoresModal && <PlayerScoresModal isOpen={showScoresModal} onClose={() => setShowScoresModal(false)} gameState={gameState} />}
    </div>
  );
}
