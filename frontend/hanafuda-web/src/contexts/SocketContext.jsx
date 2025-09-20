import { io } from "socket.io-client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePlayer } from "./PlayerContext";

const SocketContext = createContext();
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

export function SocketProvider({ children }) {
  const { player, setPlayerId, setSessionToken, setStatus, setIsReady, updateLastActive, setRoomId, setGameId, clearPlayer } = usePlayer();
  const { username, sessionToken } = player;

  const isConnecting = useRef(false);
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isSocketLoading, setIsSocketLoading] = useState(true);
  const autoConnectAttempted = useRef(false);

  const connectSocket = useCallback(
    (connectionUsername = username) => {
      if (isConnecting.current) {
        return Promise.reject(new Error("Connection already in progress"));
      }

      isConnecting.current = true;
      setStatus("connecting");
      setIsSocketLoading(true);

      return new Promise((resolve, reject) => {
        // Cleanup previous connections
        if (socketRef.current?.connected) {
          socketRef.current.removeAllListeners();
          socketRef.current.disconnect();
        }

        const newSocket = io(WEBSOCKET_URL, {
          transports: ["websocket"],
          timeout: 15000,
          autoConnect: false,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 10000,
          randomizationFactor: 0.5,
          query: {
            username: connectionUsername,
            sessionToken: sessionToken,
          },
        });

        // Connection success handler
        const handleConnect = () => {
          isConnecting.current = false;
          setIsConnected(true);
          setConnectionError(null);
          setStatus("connected");
          updateLastActive();
          socketRef.current = newSocket;
          setSocket(newSocket);
          setIsSocketLoading(false);
          resolve(newSocket);
        };

        // Transport-level connection error
        const handleConnectError = error => {
          isConnecting.current = false;
          setConnectionError(error.message);
          setIsConnected(false);
          setStatus("disconnected");
          setIsSocketLoading(false);

          // Safe disconnect - only if connected
          if (newSocket.connected) {
            newSocket.disconnect();
          } else {
            newSocket.close();
          }
          reject(error);
        };

        // Application-level connection error
        const handleConnectionError = error => {
          isConnecting.current = false;
          setConnectionError(`${error.error}: ${error.details}`);
          setIsConnected(false);
          setStatus("error");
          setIsSocketLoading(false);

          // Safe disconnect - only if connected
          if (newSocket.connected) {
            newSocket.disconnect();
          }
          reject(new Error(`${error.error}: ${error.details}`));
        };

        // General disconnect handler
        const handleDisconnect = reason => {
          setIsConnected(false);
          setStatus("disconnected");
        };

        // Session handlers
        const handleSessionCreated = data => {
          setSessionToken(data.sessionToken);
          setPlayerId(data.playerId);
          setIsReady(data.isReady);
          setIsConnected(true);
          setIsSocketLoading(false);
          updateLastActive();
        };

        const handleSessionRestored = data => {
          setSessionToken(data.sessionToken);
          setPlayerId(data.playerId);
          setIsReady(data.isReady);
          setRoomId(data.roomId);
          setGameId(data.gameId);
          setIsConnected(true);
          setIsSocketLoading(false);
          updateLastActive();
        };

        // ONLY essential event listeners
        newSocket.on("connect", handleConnect);
        newSocket.on("connect_error", handleConnectError);
        newSocket.on("connection-error", handleConnectionError);
        newSocket.on("disconnect", handleDisconnect);
        newSocket.on("session-created", handleSessionCreated);
        newSocket.on("session-restored", handleSessionRestored);

        // Connect after listeners are registered
        newSocket.connect();
      });
    },
    [player, username, sessionToken, setSessionToken, setPlayerId, setStatus, updateLastActive, setIsReady]
  );

  // Helper function to emit events with error handling
  const emitSafe = useCallback(
    (event, data, callback) => {
      if (socket?.connected) {
        updateLastActive();

        // Handle different emission patterns
        if (callback && data !== undefined) {
          socket.emit(event, data, callback);
        } else if (callback) {
          socket.emit(event, callback);
        } else if (data !== undefined) {
          socket.emit(event, data);
        } else {
          socket.emit(event);
        }

        return true;
      }

      console.warn(`Cannot emit ${event}: Socket is not connected`);

      if (callback && typeof callback === "function") {
        callback({ success: false, error: "Socket not connected" });
      }

      return false;
    },
    [socket, updateLastActive, setIsReady, setSessionToken, setPlayerId, setStatus]
  );

  // Disconnect function
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setStatus("disconnected");
      setIsSocketLoading(false);
      clearPlayer();
    }
  }, [setStatus]);

  // Auto-reconnect on mount if session exists
  useEffect(() => {
    if (username && sessionToken && !isConnected && !autoConnectAttempted.current) {
      autoConnectAttempted.current = true;
      connectSocket().catch(error => {
        autoConnectAttempted.current = false;
      });
    }
    setIsSocketLoading(false);
  }, [username, sessionToken, isConnected, connectSocket]);

  // // Set loading to false if no auto-connect is attempted after mount
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (isSocketLoading && !autoConnectAttempted.current) {
  //       setIsSocketLoading(false);
  //     }
  //   }, 1000); // Wait 1 second to see if auto-connect will be attempted

  //   return () => clearTimeout(timer);
  // }, [isSocketLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
      }
    };
  }, []);

  const value = {
    socket,
    connectSocket,
    disconnectSocket,
    isConnected,
    connectionError,
    resetError: () => setConnectionError(null),
    emitSafe,
    isSocketLoading,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
