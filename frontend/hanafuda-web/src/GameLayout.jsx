import { useLocation } from "react-router-dom";
import Navbar from "./pages/components/Navbar";

export default function GameLayout({ children }) {
  const location = useLocation();
  const locationPathname = location.pathname;
  const showNavbar = locationPathname !== "/";

  return (
    <div className="min-h-screen bg-gray-800">
      {showNavbar && <Navbar />}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
