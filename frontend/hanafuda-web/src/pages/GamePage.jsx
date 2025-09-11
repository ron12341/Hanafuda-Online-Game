import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { usePlayer } from "../contexts/PlayerContext";
import { useGame } from "../contexts/GameContext";

export default function GamePage() {
  const { gameId } = useParams();
  const { isConnected } = useSocket();
  const { player } = usePlayer();
  const { gameState, fetchGameData, playCard } = useGame();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myTurn, setMyTurn] = useState(false);

  const [selectedHandCard, setSelectedHandCard] = useState(null);
  const [filteredTableCards, setFilteredTableCards] = useState([]);

  const navigate = useNavigate();

  const [gameData, setGameData] = useState({
    players: [
      { id: 1, name: "You", cards: 8, captured: 5, isCurrent: true, score: 45 },
      { id: 2, name: "Player 2", cards: 8, captured: 3, isCurrent: false, score: 30 },
      { id: 3, name: "Player 3", cards: 8, captured: 4, isCurrent: false, score: 25 },
      { id: 4, name: "Player 4", cards: 8, captured: 2, isCurrent: false, score: 20 },
    ],
    playerHand: Array(8)
      .fill(null)
      .map((_, i) => ({
        id: i + 1,
        type: ["red", "blue", "green", "yellow"][i % 4],
        name: `Card ${i + 1}`,
      })),
    tableCards: Array(6)
      .fill(null)
      .map((_, i) => ({
        id: i + 20,
        type: ["purple", "orange", "teal", "pink"][i % 4],
        name: `Table Card ${i + 1}`,
      })),
    flippedCard: {
      id: 30,
      type: "special",
      name: "Flipped Card",
      isFlipped: true,
    },
    deckCount: 24,
    round: 10,
    status: "Your Turn",
  });

  const getColor = (type) => {
    const colors = {
      red: "#e74c3c",
      blue: "#3498db",
      green: "#2ecc71",
      yellow: "#f1c40f",
      purple: "#9b59b6",
      orange: "#e67e22",
      teal: "#1abc9c",
      pink: "#e91e63",
      special: "#8e44ad",
    };
    return colors[type] || "#95a5a6";
  };

  const Card = ({
    card,
    onClick,
    selected = false,
    size = "medium",
    flipped = false,
    src,
    alt,
    isDisabled = false,
    isSelectable = false,
    cardType = "hand",
  }) => {
    // Define size classes explicitly for Tailwind
    let width, height;

    if (size === "large") {
      width = "w-32"; // 128px
      height = "h-48"; // 192px
    } else if (size === "small") {
      width = "w-16"; // 64px
      height = "h-24"; // 96px
    } else {
      width = "w-24"; // 96px
      height = "h-36"; // 144px
    }

    const shouldShowPointer = !isDisabled && (cardType === "hand" || (cardType === "table" && isSelectable));

    if (src && alt) {
      return (
        <div
          className={`rounded-lg shadow-lg flex flex-col justify-between p-2 transition-all duration-200 ${
            selected
              ? "ring-4 ring-yellow-400 transform -translate-y-2"
              : shouldShowPointer
              ? "cursor-pointer hover:-translate-y-1"
              : ""
          } ${width} ${height}} ${isDisabled ? "opacity-50" : ""}`}
          onClick={shouldShowPointer ? onClick : undefined}
        >
          <img src={src} alt={alt} />
        </div>
      );
    }

    return (
      <div
        className={`rounded-lg shadow-lg flex flex-col justify-between p-2 cursor-pointer transition-all duration-200 ${
          selected ? "ring-4 ring-yellow-400 transform -translate-y-2" : "hover:-translate-y-1"
        } ${width} ${height} ${flipped ? "border-2 border-dashed border-yellow-400" : ""}`}
        style={{ backgroundColor: flipped ? "#2c3e50" : getColor(card.type) }}
        onClick={onClick}
      >
        {flipped ? (
          <div className="text-center text-white font-semibold text-sm">Flipped</div>
        ) : (
          <>
            <div className="text-center text-white font-semibold text-sm">{card.name}</div>
            <div className="text-center text-white text-xs">{card.type}</div>
          </>
        )}
      </div>
    );
  };

  const handleSelectHandCard = (handCard) => {
    if (handCard === selectedHandCard) {
      setSelectedHandCard(null);
      setFilteredTableCards([]);
    } else {
      setSelectedHandCard(handCard);
      setFilteredTableCards(gameState.table.filter((card) => isSameMonth(card, handCard)));
    }
  };

  const handleCaptureCard = async (targetCard) => {
    if (isSameMonth(selectedHandCard, targetCard)) {
      const result = await playCard(gameState.id, player.playerId, selectedHandCard.id, targetCard.id);

      if (!result.success) {
        setError(result.error);
      } else {
        console.log("Played card:", result.handCard, result.tableCard);
      }

      setSelectedHandCard(null);
      setFilteredTableCards([]);
    }
  };

  const isSameMonth = (card1, card2) => {
    return card1.month === card2.month;
  };

  useEffect(() => {
    console.log("Game page mounted");

    const loadGame = async () => {
      try {
        setLoading(true);
        await fetchGameData(gameId);
      } catch (err) {
        setError("Failed to load game");
        console.error("Game load error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isConnected && gameId) {
      loadGame();
    }
  }, [isConnected, gameId]);

  useEffect(() => {
    if (!player || !gameState) return;

    setMyTurn(gameState.players?.[gameState.currentTurnIndex]?.id === player.id);
  }, [gameState?.currentTurnIndex, player?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate("/lobby")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Game not found</p>
          <button
            onClick={() => navigate("/lobby")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-4 flex flex-col">
      {/* Top Section */}
      <div className="bg-black bg-opacity-70 rounded-xl p-4 mb-4 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <p className="text-yellow-300">
                {gameState.players[gameState.currentTurnIndex]?.name ?? "Unknown"}'s Turn
              </p>
              <p className="text-blue-300">Round: {gameState.currentRound}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex flex-wrap gap-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors text-sm"
                // onClick={toggleCapturedCards}
              >
                View Captured
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg transition-colors text-sm"
                // onClick={toggleScores}
              >
                View Scores
              </button>
              <button
                className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg transition-colors text-sm"
                // onClick={toggleCombos}
              >
                View Combos
              </button>
              <button
                className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-lg transition-colors text-sm"
                // onClick={toggleHelp}
              >
                Help/Rules
              </button>
              <button
                className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors text-sm"
                // onClick={toggleMenu}
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Players Captured Cards info */}
      <div className="bg-black bg-opacity-50 rounded-xl p-3 mb-4 flex justify-around">
        {gameState.players.map((gamePlayer) => (
          <div
            key={gamePlayer.id}
            className={`text-center px-4 py-2 rounded-lg ${
              gamePlayer.id === player.playerId ? "bg-blue-700" : "bg-gray-800"
            }`}
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
              <Card
                card={gameData.flippedCard}
                flipped={true}
                // onClick={() => handleCardSelect(gameData.flippedCard)}
                selected={selectedHandCard?.id === gameData.flippedCard.id}
                size="medium"
              />
            </div>

            <div className="text-center">
              <h2 className="text-yellow-200 font-semibold mb-4">Deck</h2>
              <div className="relative">
                <div className="w-24 h-36 rounded-lg bg-gray-800 shadow-xl flex items-center justify-center">
                  <span className="text-white text-xl">{gameData.deckCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Table Cards */}
          <div className="flex-1 bg-black bg-opacity-30 rounded-lg p-4 flex flex-wrap justify-center items-center gap-4">
            {gameState.table.map((card) => (
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
            ))}
          </div>

          {selectedHandCard && filteredTableCards.length <= 0 && (
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

      {/* My Cards */}
      <div className="bg-black bg-opacity-70 rounded-xl p-4 shadow-lg">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1">
            <h2 className="text-green-300 font-semibold mb-3 text-center md:text-left">Your Hand</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {gameState.myHand.map((card) => (
                <Card
                  key={card.id}
                  onClick={() => handleSelectHandCard(card)}
                  selected={selectedHandCard?.id === card.id}
                  size="medium"
                  src={card.image}
                  alt={card.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
