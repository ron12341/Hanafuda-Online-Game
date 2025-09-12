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

  const [notification, setNotification] = useState("ROUND ENDED!");

  const navigate = useNavigate();

  const [gameData, setGameData] = useState({
    deckCount: 24,
    round: 10,
    status: "Your Turn",
  });

  // Check if flipped card should be automatically selected
  const shouldAutoSelectFlippedCard = gameState.flippedCard && myTurn;
  const handCardsDisabled = shouldAutoSelectFlippedCard;

  useEffect(() => {
    if (shouldAutoSelectFlippedCard) {
      setSelectedHandCard(gameState.flippedCard);
    }
  }, [shouldAutoSelectFlippedCard, gameState.flippedCard]);

  const Card = ({ card, onClick, selected = false, size = "medium", cardType = "hand", src, alt, isDisabled = false, isSelectable = false }) => {
    // Define size classes
    const sizeClasses = {
      large: {
        width: "w-24",
        height: "h-48",
      },
      medium: {
        width: "w-20",
        height: "h-40",
      },
      small: {
        width: "w-16",
        height: "h-32",
      },
    };

    const { width, height } = sizeClasses[size] || sizeClasses.medium;

    // Determine card type behavior
    const isHandCard = cardType === "hand";
    const isFlippedCard = cardType === "flipped" || !card;
    const isTableCard = cardType === "table";

    // Determine interactivity - hand cards are disabled when flipped card exists
    const shouldShowPointer = !isDisabled && (isHandCard || (isTableCard && isSelectable));
    const isInteractive = shouldShowPointer && onClick;

    // Handle image cards (if card exists and has image)
    if (card && src && alt) {
      return (
        <div
          className={`
          rounded-lg shadow-lg flex flex-col justify-between transition-all duration-200
          ${selected ? "ring-4 ring-yellow-400 transform -translate-y-2" : ""}
          ${shouldShowPointer ? "cursor-pointer hover:-translate-y-1" : ""}
          ${width} ${height}
          ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
          ${handCardsDisabled && isHandCard ? "opacity-70 cursor-not-allowed" : ""}
        `}
          onClick={isInteractive ? onClick : undefined}
        >
          <img src={src} alt={alt} className="w-full h-full object-contain rounded-md" />
        </div>
      );
    }

    // Handle empty flipped card (when card is undefined)
    if (isFlippedCard) {
      return (
        <div
          className={`
          ${width} ${height} pt-2 pb-2 ml-auto mr-auto
        `}
        >
          <div className="w-full h-full bg-gray-800 rounded-md flex items-center justify-center shadow-lg transition-all duration-200 border-2 border-dashed border-yellow-400">
            <p>Empty</p>
          </div>
        </div>
      );
    }
  };

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

  useEffect(() => {
    const filterTableCards = () => {
      if (!selectedHandCard) {
        setFilteredTableCards([]);
        return;
      }
      console.log("SELECTED HAND CARD", selectedHandCard);
      console.log("TABLE CARDS", gameState.table);
      setFilteredTableCards(gameState.table.filter(card => isSameMonth(card, selectedHandCard)));
    };

    filterTableCards();
  }, [selectedHandCard]);

  useEffect(() => {
    console.log("Game page mounted");

    const loadGame = async () => {
      try {
        setLoading(true);
        const result = await fetchGameData(gameId);

        if (result.success) {
          const data = result.data;
          setMyTurn(data.players?.[data.currentTurnIndex]?.id === player.playerId);
          console.log(data.players?.[data.currentTurnIndex]?.id, player.playerId);
        }
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

    setMyTurn(isMyTurn());
  }, [gameState?.currentTurnIndex, player?.id]);

  const isMyTurn = () => {
    return gameState.players?.[gameState.currentTurnIndex]?.id === player.playerId;
  };

  if (gameState.isLoading) {
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
          <button onClick={() => navigate("/lobby")} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
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
          <button onClick={() => navigate("/lobby")} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-4 flex flex-col">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          {notification}
        </div>
      )}

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
        {gameState.players.map(gamePlayer => (
          <div
            key={gamePlayer.id}
            className={`text-center px-4 py-2 rounded-lg ${gamePlayer.id === player.playerId ? "bg-blue-700" : "bg-gray-800"}`}
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
            {gameState.table.map(
              card => (
                console.log("SELECTED HAND CARD", selectedHandCard),
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

      {/* My Cards */}
      {/* <div className="bg-black bg-opacity-70 rounded-xl p-4 shadow-lg">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1">
            <h2 className="text-green-300 font-semibold mb-3 text-center md:text-left">Your Hand</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {gameState.myHand.map(card => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => handleSelectHandCard(card)}
                  selected={selectedHandCard?.id === card.id}
                  size="medium"
                  src={card.image}
                  alt={card.name}
                  cardType="hand"
                />
              ))}
            </div>
          </div>
        </div>
      </div> */}

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
              {gameState.myHand.map(card => (
                <Card
                  key={card.id}
                  card={card}
                  onClick={() => handleSelectHandCard(card)}
                  selected={selectedHandCard?.id === card.id}
                  size="medium"
                  src={card.image}
                  alt={card.name}
                  cardType="hand"
                  isDisabled={handCardsDisabled} // Disable all hand cards
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
