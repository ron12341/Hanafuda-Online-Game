export interface PlayerSession {
  playerId: string;
  username: string;
  socketId: string;
  roomId?: string;
  gameId?: string;
  lastActive: number;
  isConnected: boolean;
  isReady: boolean;
}
