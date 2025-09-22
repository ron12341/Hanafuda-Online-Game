import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../contexts/PlayerContext";

export default function InvalidRouteHandler() {
  const navigate = useNavigate();
  const { player } = usePlayer();

  useEffect(() => {
    if (player.status === "connecting") return;

    if (player.status === "disconnected") {
      console.log("Redirecting to login page");
      navigate("/", { replace: true });
    } else {
      if (player.gameId) {
        console.log("Redirecting to game page: ", player.gameId);
        navigate(`/game/${player.gameId}`, { replace: true });
      } else if (player.roomId) {
        console.log("Redirecting to room page: ", player.roomId);
        navigate(`/room/${player.roomId}`, { replace: true });
      } else {
        console.log("Redirecting to lobby page");
        navigate("/", { replace: true });
      }
    }
  }, [player.status]);

  return null;
}
