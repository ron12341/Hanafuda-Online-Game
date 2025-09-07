import { SocketProvider } from "./contexts/SocketContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { LobbyProvider } from "./contexts/LobbyContext";
import Connect from "./pages/Connect";
import LobbyPage from "./pages/LobbyPage";
import RoomPage from "./pages/RoomPage";
import { useSocket } from "./contexts/SocketContext";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { RoomProvider } from "./contexts/RoomContext";

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Connect />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
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
            <AppContent />
          </RoomProvider>
        </LobbyProvider>
      </SocketProvider>
    </PlayerProvider>
  );
}

export default App;
