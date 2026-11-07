# Hanafuda Online – Backend

The backend server for **Hanafuda Online**, a real-time multiplayer Hanafuda card game. It handles player connections, lobby management, game rooms, game sessions, and multiplayer game logic through WebSocket communication.

## Architecture

The backend follows a modular architecture that separates core game logic, application services, interfaces, and utility functions.

### Project Structure

```text
game-server/
│
├── src/
│   ├── index.ts
│   │
│   ├── constants/
│   │   └── combos.ts
│   │
│   ├── core/
│   │   ├── Card.ts
│   │   ├── Deck.ts
│   │   ├── Game.ts
│   │   ├── Lobby.ts
│   │   ├── Player.ts
│   │   └── Room.ts
│   │
│   ├── interfaces/
│   │   ├── card.interface.ts
│   │   ├── game.interface.ts
│   │   ├── player.interface.ts
│   │   ├── room.interface.ts
│   │   ├── services.interface.ts
│   │   ├── session.interface.ts
│   │   ├── socket.interface.ts
│   │   │
│   │   └── dtos/
│   │       ├── LobbyState.dto.ts
│   │       ├── PlayerState.dto.ts
│   │       └── RoomState.dto.ts
│   │
│   ├── services/
│   │   ├── GameService.ts
│   │   ├── LobbyService.ts
│   │   ├── PlayerService.ts
│   │   ├── RoomService.ts
│   │   ├── ServiceContainer.ts
│   │   ├── SessionService.ts
│   │   └── SocketManager.ts
│   │
│   └── utils/
│       ├── ComboCalculator.ts
│       └── generateId.ts
│
├── package.json
├── tsconfig.json
└── README.md
```

### Directory Overview

| Directory / File   | Description                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `constants/`       | Static game data, including Hanafuda card combinations.                                                              |
| `core/`            | Core game entities and game logic, including cards, decks, players, rooms, lobbies, and games.                       |
| `interfaces/`      | TypeScript interfaces defining the structure of game entities, services, sessions, and socket communication.         |
| `interfaces/dtos/` | Data Transfer Objects defining the state information exchanged between the server and clients.                       |
| `services/`        | Application services responsible for managing game logic, players, lobbies, rooms, sessions, and socket connections. |
| `utils/`           | Shared utility functions, including combo calculation and ID generation.                                             |
| `index.ts`         | Backend entry point responsible for initializing the HTTP and Socket.IO servers and application services.            |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- npm
- A running frontend application or Socket.IO client

### Installation

1. Navigate to the backend project directory:

   ```bash
   cd backend/game-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `game-server/` root directory:

   ```env
   PORT=3000
   ```

   The server defaults to port `3000` if no `PORT` environment variable is provided.

### Running the Development Server

```bash
npm run dev
```

The development server uses `ts-node` and `tsconfig-paths` to execute TypeScript files directly.

By default, the Socket.IO server listens on:

```text
http://localhost:3000
```

## Production Build

Compile the TypeScript source files:

```bash
npm run build
```

This generates the compiled JavaScript output in the `dist/` directory, as configured by the TypeScript compiler.

Start the production server:

```bash
npm run dev
```

The production startup script registers `module-alias` to resolve the configured module aliases.

## Module Aliases

The backend uses module aliases to simplify imports and avoid deeply nested relative paths.

| Alias         | Directory         |
| ------------- | ----------------- |
| `@services`   | `dist/services`   |
| `@interfaces` | `dist/interfaces` |
| `@core`       | `dist/core`       |
| `@utils`      | `dist/utils`      |
| `@constants`  | `dist/constants`  |

Example:

```typescript
import { GameService } from "@services/GameService";
import { Card } from "@core/Card";
```

Development alias resolution is handled by `tsconfig-paths`, while production uses `module-alias`.

## Frontend Integration

The backend communicates with the frontend through Socket.IO, enabling real-time multiplayer functionality.

Configure the frontend environment variable to point to the backend server:

```env
VITE_WEBSOCKET_URL=http://localhost:3000
```

The frontend uses the Socket.IO client to establish a connection with the backend.

## Related Project

This backend is part of the **Hanafuda Online** full-stack application.

See the root repository README for the complete project overview, features, screenshots, and frontend documentation.

---

**Built with Node.js, TypeScript, Express, and Socket.IO.**
