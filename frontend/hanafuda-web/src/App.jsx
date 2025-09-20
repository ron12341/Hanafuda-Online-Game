import { Routes, Route, BrowserRouter } from "react-router-dom";
import { RoomProvider } from "./contexts/RoomContext";
import { SocketProvider } from "./contexts/SocketContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { LobbyProvider } from "./contexts/LobbyContext";
import { GameProvider } from "./contexts/GameContext";
import Connect from "./pages/Connect";
import LobbyPage from "./pages/lobby/LobbyPage";
import RoomPage from "./pages/RoomPage";
import GamePage from "./pages/GamePage";
import InvalidRouteHandler from "./pages/InvalidRouteHandler";
import GameLayout from "./GameLayout";

function AppContent() {
  return (
    <BrowserRouter>
      <GameLayout>
        <Routes>
          <Route path="/" element={<Connect />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
          <Route path="*" element={<InvalidRouteHandler />} />
        </Routes>
      </GameLayout>
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
