export interface PlayerSession {
  playerId: string;
  username: string;
  socketId: string;
  lastActive: number;
  isConnected: boolean;
  isReady: boolean;
}
