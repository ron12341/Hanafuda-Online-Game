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

export default function GamePage() {
  const { gameId } = useParams();
  const { isConnected, isSocketLoading } = useSocket();
  const { player } = usePlayer();
  const { gameState, fetchGameData, playCard, clearGame } = useGame();
  const { clearRoom } = useRoom();
  const [myTurn, setMyTurn] = useState(false);

  const [selectedHandCard, setSelectedHandCard] = useState(null);
  const [filteredTableCards, setFilteredTableCards] = useState([]);

  const [showCapturedModal, setShowCapturedModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    return card1.month === card2.month;
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
    <div className="min-h-screen bg-gray-800 text-white p-4 flex flex-col">
      {/* Top Section */}
      <div className="bg-black bg-opacity-70 rounded-xl p-4 mb-4 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <p className="text-yellow-300">{gameState.players[gameState.currentTurnIndex]?.name ?? "Unknown"}'s Turn</p>
              <p className="text-blue-300">Round: {gameState.currentRound}</p>
              {handCardsDisabled && <p className="text-red-300 animate-pulse">⚠️ Flipped card must be played first</p>}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex flex-wrap gap-2">
              <button
                disabled={true}
                className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                // onClick={toggleScores}
              >
                View Scores
              </button>
              <button
                className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => window.open("/combos", "_blank")}
              >
                View Combos
              </button>
              <button
                className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => window.open("/cards-library", "_blank")}
              >
                View Card Library
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Players Captured Cards info */}
      <div className="bg-black bg-opacity-50 rounded-xl p-3 mb-4 flex justify-around">
        {gameState.players.map(gamePlayer => (
          <div
            key={gamePlayer.id}
            className={`
        text-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200
        border-2
        ${
          gamePlayer.id === player.playerId
            ? "bg-blue-700 border-blue-500 hover:border-yellow-300"
            : "bg-gray-800 border-gray-600 hover:border-yellow-400"
        }
      `}
            onClick={() => handleShowCapturedCards(gamePlayer)}
          >
            <div className="font-semibold">{gamePlayer.name}</div>
            <div className="text-sm">Captured: {gamePlayer.captured.length}</div>
          </div>
        ))}
      </div>

      {/* Game Board */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 mb-4">
        <div className="flex-1 bg-green-900 bg-opacity-50 rounded-xl p-6 flex flex-col lg:flex-row gap-4">
          {/* Flipped Card & Deck Area */}
          <div className="min-w-[350px] bg-black bg-opacity-30 rounded-lg p-4 flex items-center justify-evenly">
            <div className="text-center">
              <h3 className="text-yellow-300 font-semibold mb-2">Flipped Card</h3>

              {gameState.flippedCard ? (
                <Card
                  card={gameState.flippedCard}
                  selected={selectedHandCard?.id === gameState.flippedCard.id}
                  size="medium"
                  src={gameState.flippedCard.image}
                  alt={gameState.flippedCard.name}
                  cardType="flipped"
                  handCardsDisabled={handCardsDisabled}
                />
              ) : (
                <Card card={undefined} size="medium" cardType="flipped" />
              )}
            </div>

            <div className="text-center">
              <h2 className="text-yellow-200 font-semibold mb-4">Deck</h2>
              <div className="relative">
                <div className="w-24 h-36 rounded-lg bg-gray-800 shadow-xl flex items-center justify-center">
                  <span className="text-white text-xl">{gameState.deckSize}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Cards */}
          <div className="flex-1 bg-black bg-opacity-30 rounded-lg p-4 flex flex-wrap justify-center items-center gap-4">
            {gameState.table &&
              gameState.table.map(
                card =>
                  card && (
                    <Card
                      key={card.id}
                      card={card}
                      onClick={() => handleCaptureCard(card)}
                      selected={selectedHandCard?.id === card.id}
                      size="medium"
                      src={card.image}
                      alt={card.name}
                      isDisabled={selectedHandCard && !isSameMonth(selectedHandCard, card)}
                      isSelectable={!!selectedHandCard}
                      cardType="table"
                    />
                  )
              )}
          </div>

          {selectedHandCard && filteredTableCards.length <= 0 && myTurn && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 z-50">
              <button
                onClick={() => handleDiscardCard(selectedHandCard)}
                className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-all duration-200 text-lg"
              >
                📤 Discard Card
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-black bg-opacity-70 rounded-xl p-4 shadow-lg">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1">
            <h2 className="text-green-300 font-semibold mb-3 text-center md:text-left">
              {myTurn ? (
                <>
                  Your Turn
                  {handCardsDisabled && <span className="text-red-300 text-sm ml-2">(Play flipped card first)</span>}
                </>
              ) : (
                "Waiting for your turn..."
              )}
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {gameState.myHand &&
                gameState.myHand.map(card => (
                  <Card
                    key={card.id}
                    card={card}
                    onClick={() => handleSelectHandCard(card)}
                    selected={selectedHandCard?.id === card.id}
                    size="medium"
                    src={card.image}
                    alt={card.name}
                    cardType="hand"
                    isDisabled={handCardsDisabled}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Round transition notification */}
      {gameState.showRoundTransition && <RoundTransitionModal duration={5} roundResult={gameState.roundResult} />}

      <GameOverModal
        // isGameOver={gameState.isGameOver}
        // winner={gameState.winner}
        // scores={gameState.scores}
        isGameOver={gameState.isGameOver}
        winner={gameState.winner}
        scores={gameState.finalScores}
        onExit={handleExitGame}
      />

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
    </div>
  );
}
