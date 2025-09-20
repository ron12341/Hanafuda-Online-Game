import { createContext, useContext, useState, useEffect } from "react";

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  // Single state object for better organization
  const [player, setPlayer] = useState(() => {
    const saved = sessionStorage.getItem("hanafuda-player");
    if (!saved) {
      return {
        username: "",
        playerId: "",
        sessionToken: "",
        roomId: "",
        gameId: "",
        status: "disconnected",
        lastActive: null,
        isReady: false,
      };
    }

    try {
      const playerData = JSON.parse(saved);

      // Check if data has expired
      if (playerData._expiry && playerData._expiry < Date.now()) {
        sessionStorage.removeItem("hanafuda-player");
        return {
          username: "",
          playerId: "",
          sessionToken: "",
          roomId: "",
          gameId: "",
          status: "disconnected",
          lastActive: null,
          isReady: false,
        };
      }

      return playerData;
    } catch (error) {
      console.error("Error parsing player data:", error);
      sessionStorage.removeItem("hanafuda-player");
      return {
        username: "",
        playerId: "",
        sessionToken: "",
        roomId: "",
        gameId: "",
        status: "disconnected",
        lastActive: null,
        isReady: false,
      };
    }
  });

  // Auto-save to sessionStorage with expiration
  useEffect(() => {
    if (player.username || player.playerId || player.sessionToken) {
      const playerDataWithExpiry = {
        ...player,
        _expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
      };
      sessionStorage.setItem("hanafuda-player", JSON.stringify(playerDataWithExpiry));
    } else {
      sessionStorage.removeItem("hanafuda-player");
    }
  }, [player]);

  // Check expiry on mount and periodically
  useEffect(() => {
    const checkExpiry = () => {
      const saved = sessionStorage.getItem("hanafuda-player");
      if (!saved) return;

      try {
        const playerData = JSON.parse(saved);
        if (playerData._expiry && playerData._expiry < Date.now()) {
          sessionStorage.removeItem("hanafuda-player");
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
      } catch (error) {
        console.error("Error checking expiry:", error);
        sessionStorage.removeItem("hanafuda-player");
      }
    };

    // Check on mount
    checkExpiry();

    // Check every hour (much less frequent than with localStorage)
    const interval = setInterval(checkExpiry, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Helper functions for updates
  const updatePlayer = updates => {
    setPlayer(prev => ({ ...prev, ...updates }));
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
  const setUsername = username => updatePlayer({ username });
  const setPlayerId = playerId => updatePlayer({ playerId });
  const setSessionToken = sessionToken => updatePlayer({ sessionToken });
  const setRoomId = roomId => updatePlayer({ roomId });
  const setGameId = gameId => updatePlayer({ gameId });
  const setIsReady = isReady => updatePlayer({ isReady });
  const setStatus = status => updatePlayer({ status });
  const updateLastActive = () => updatePlayer({ lastActive: Date.now() });

  const value = {
    player: {
      ...player,
      setGameId,
    },

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
