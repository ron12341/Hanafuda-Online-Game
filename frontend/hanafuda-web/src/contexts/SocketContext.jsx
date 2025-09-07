import { io } from "socket.io-client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePlayer } from "./PlayerContext";

const SocketContext = createContext();
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

export function SocketProvider({ children }) {
  const { player, setPlayerId, setSessionToken, setStatus, setIsReady, updateLastActive } = usePlayer();

  const { username, sessionToken } = player;

  const isConnecting = useRef(false);
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const autoConnectAttempted = useRef(false);

  const connectSocket = useCallback(
    (connectionUsername = username) => {
      if (isConnecting.current) {
        return Promise.reject(new Error("Connection already in progress"));
      }

      isConnecting.current = true;
      setStatus("connecting");

      return new Promise((resolve, reject) => {
        console.log("Connecting to socket...", connectionUsername);

        // Cleanup previous connections
        if (socketRef.current?.connected) {
          socketRef.current.removeAllListeners();
          socketRef.current.disconnect();
        }

        const newSocket = io(WEBSOCKET_URL, {
          autoConnect: false,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          query: {
            username: connectionUsername,
            sessionToken: sessionToken,
          },
        });

        // Connection success handler
        const handleConnect = () => {
          console.log("Socket connected: ", newSocket.id);
          isConnecting.current = false;
          setIsConnected(true);
          setConnectionError(null);
          setStatus("connected");
          updateLastActive();
          socketRef.current = newSocket;
          setSocket(newSocket);
          resolve(newSocket);
        };

        // Transport-level connection error
        const handleConnectError = (error) => {
          console.log("Transport connection failed: ", error);
          isConnecting.current = false;
          setConnectionError(error.message);
          setIsConnected(false);
          setStatus("disconnected");

          // Safe disconnect - only if connected
          if (newSocket.connected) {
            newSocket.disconnect();
          } else {
            newSocket.close();
          }
          reject(error);
        };

        // Application-level connection error
        const handleConnectionError = (error) => {
          console.log("Application connection error: ", error.error, error.details);
          isConnecting.current = false;
          setConnectionError(`${error.error}: ${error.details}`);
          setIsConnected(false);
          setStatus("error");

          // Safe disconnect - only if connected
          if (newSocket.connected) {
            newSocket.disconnect();
          }
          reject(new Error(`${error.error}: ${error.details}`));
        };

        // General disconnect handler
        const handleDisconnect = (reason) => {
          console.log("Socket disconnected: ", reason);
          setIsConnected(false);
          setStatus("disconnected");
        };

        // Session handlers
        const handleSessionCreated = (data) => {
          console.log("Session created: ", data);
          setSessionToken(data.sessionToken);
          setPlayerId(data.playerId);
          setIsReady(data.isReady);
          updateLastActive();
        };

        const handleSessionRestored = (data) => {
          console.log("Session restored: ", data);
          setSessionToken(data.sessionToken);
          setPlayerId(data.playerId);
          setIsReady(data.isReady);
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
    [username, sessionToken, setSessionToken, setPlayerId, setStatus, updateLastActive]
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

      // Optional: Trigger reconnection or show UI feedback
      if (callback && typeof callback === "function") {
        callback({ success: false, error: "Socket not connected" });
      }

      return false;
    },
    [socket, updateLastActive]
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
    }
  }, [setStatus]);

  // Auto-reconnect on mount if session exists
  useEffect(() => {
    if (username && sessionToken && !isConnected && !autoConnectAttempted.current) {
      autoConnectAttempted.current = true;
      console.log("Auto-reconnecting with existing session...");
      connectSocket().catch((error) => {
        console.log("Auto-reconnect failed:", error.message);
        autoConnectAttempted.current = false;
      });
    }
  }, [username, sessionToken, isConnected, connectSocket]);

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
