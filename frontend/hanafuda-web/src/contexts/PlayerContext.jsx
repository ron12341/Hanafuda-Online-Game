import { createContext, useContext, useState, useEffect } from "react";

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  // Single state object for better organization
  const [player, setPlayer] = useState(() => {
    const saved = localStorage.getItem("hanafuda-player");
    return saved
      ? JSON.parse(saved)
      : {
          username: "",
          playerId: "",
          sessionToken: "",
          roomId: "",
          gameId: "",
          status: "disconnected",
          lastActive: null,
          isReady: false,
        };
  });

  // Auto-save to localStorage with expiration
  useEffect(() => {
    if (player.username || player.playerId || player.sessionToken) {
      const playerDataWithExpiry = {
        ...player,
        _expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
      };
      localStorage.setItem("hanafuda-player", JSON.stringify(playerDataWithExpiry));
    } else {
      localStorage.removeItem("hanafuda-player");
    }
  }, [player]);

  // Check expiry on mount and periodically
  useEffect(() => {
    const checkExpiry = () => {
      const saved = localStorage.getItem("hanafuda-player");
      if (saved) {
        const playerData = JSON.parse(saved);
        if (playerData._expiry && playerData._expiry < Date.now()) {
          console.log("Player data expired, clearing...");
          localStorage.removeItem("hanafuda-player");
          setPlayer({
            username: "",
            playerId: "",
            sessionToken: "",
            roomId: "",
            gameId: "",
            status: "disconnected",
            lastActive: null,
            isReady: false,
          });
        }
      }
    };

    // Check on mount
    checkExpiry();

    // Check every hour
    const interval = setInterval(checkExpiry, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Helper functions for updates
  const updatePlayer = (updates) => {
    setPlayer((prev) => ({ ...prev, ...updates }));
  };

  const clearPlayer = () => {
    setPlayer({
      username: "",
      playerId: "",
      sessionToken: "",
      roomId: "",
      gameId: "",
      status: "disconnected",
      lastActive: null,
      isReady: false,
    });
  };

  // Specific setters for convenience
  const setUsername = (username) => updatePlayer({ username });
  const setPlayerId = (playerId) => updatePlayer({ playerId });
  const setSessionToken = (sessionToken) => updatePlayer({ sessionToken });
  const setRoomId = (roomId) => updatePlayer({ roomId });
  const setGameId = (gameId) => updatePlayer({ gameId });
  const setIsReady = (isReady) => updatePlayer({ isReady });
  const setStatus = (status) => updatePlayer({ status });
  const updateLastActive = () => updatePlayer({ lastActive: Date.now() });

  const value = {
    // Player data
    player,

    // Individual values (for backward compatibility)
    username: player.username,
    playerId: player.playerId,
    sessionToken: player.sessionToken,
    roomId: player.roomId,
    gameId: player.gameId,
    status: player.status,
    isReady: player.isReady,

    // Update functions
    setPlayer: updatePlayer,
    setUsername,
    setPlayerId,
    setSessionToken,
    setRoomId,
    setGameId,
    setStatus,
    setIsReady,
    updateLastActive,
    clearPlayer,

    // Helper computed properties
    isLoggedIn: !!player.username && !!player.playerId,
    hasActiveSession: !!player.sessionToken,
    isInRoom: !!player.roomId,
    isInGame: !!player.gameId,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return context;
}
