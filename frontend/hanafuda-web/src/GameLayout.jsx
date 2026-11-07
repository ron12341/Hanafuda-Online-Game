import { useLocation } from "react-router-dom";
import Navbar from "./pages/components/Navbar";

export default function GameLayout({ children }) {
  const location = useLocation();
  const showNavbar = location.pathname !== "/";

  return (
    <div className="h-[100dvh] bg-gray-800 flex flex-col overflow-hidden">
      {showNavbar && <Navbar />}

      <main className="flex-1 min-h-0 overflow-auto">{children}</main>
    </div>
  );
}
