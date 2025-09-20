import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";

export default function InvalidRouteHandler() {
  const navigate = useNavigate();
  const { isConnected } = useSocket();

  useEffect(() => {
    if (isConnected) {
      navigate("/lobby", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [isConnected]);

  return null;
}
