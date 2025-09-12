import { SocketProvider } from "./contexts/SocketContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { LobbyProvider } from "./contexts/LobbyContext";
import { GameProvider } from "./contexts/GameContext";
import Connect from "./pages/Connect";
import LobbyPage from "./pages/LobbyPage";
import RoomPage from "./pages/RoomPage";
import GamePage from "./pages/GamePage";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { RoomProvider } from "./contexts/RoomContext";

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Connect />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <PlayerProvider>
      <SocketProvider>
        <LobbyProvider>
          <RoomProvider>
            <GameProvider>
              <AppContent />
            </GameProvider>
          </RoomProvider>
        </LobbyProvider>
      </SocketProvider>
    </PlayerProvider>
  );
}

export default App;
