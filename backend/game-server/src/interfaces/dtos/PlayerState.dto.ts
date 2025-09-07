export interface PlayerStateDTO {
  id: string;
  name: string;
  isReady: boolean;
  status: "in-lobby" | "in-room" | "in-game";
  roomId?: string;
  gameId?: string;
}
