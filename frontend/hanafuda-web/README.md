# Hanafuda Online – Frontend

The frontend application for **Hanafuda Online**, a real-time multiplayer Hanafuda card game. Players can connect with others, join or create game rooms, and play Hanafuda together through a responsive web interface.

## Features

- **Multiplayer Gameplay** – Real-time communication with other players using Socket.IO.
- **Lobby System** – Browse available rooms, create rooms, and view online players.
- **Game Interface** – Interactive card gameplay with turn indicators and player information.
- **Card Library** – Browse the available Hanafuda cards.
- **Combo Reference** – View available card combinations and their scoring information.
- **Game Results** – View captured cards, player scores, round transitions, and game results.
- **Responsive UI** – Interface designed to adapt to different screen sizes.
- **PWA Support** – Progressive Web App capabilities.

## Project Structure

```text
hanafuda-web/
│
├── assets/
│   └── react.svg
│
├── constants/
│   ├── allCards.js
│   └── combos.js
│
├── contexts/
│   ├── GameContext.jsx
│   ├── LobbyContext.jsx
│   ├── PlayerContext.jsx
│   ├── RoomContext.jsx
│   └── SocketContext.jsx
│
├── pages/
│   ├── CardLibraryPage.jsx
│   ├── ComboPage.jsx
│   ├── Connect.jsx
│   ├── GamePage.jsx
│   ├── InvalidRouteHandler.jsx
│   ├── RoomPage.jsx
│   │
│   ├── components/
│   │   ├── CapturedCardsModal.jsx
│   │   ├── Card.jsx
│   │   ├── ComboDisplay.jsx
│   │   ├── GameOverModal.jsx
│   │   ├── Navbar.jsx
│   │   ├── PlayerScoresModal.jsx
│   │   └── RoundTransitionModal.jsx
│   │
│   └── lobby/
│       ├── LobbyPage.jsx
│       └── components/
│           ├── CreateRoomSection.jsx
│           ├── OnlinePlayersList.jsx
│           ├── RoomList.jsx
│           └── SettingsModal.jsx
│
├── utils/
│   └── calculateCardSize.js
│
├── App.jsx
├── GameLayout.jsx
├── index.css
├── main.jsx
├── package.json
└── README.md
```

### Directory Overview

| Directory / File    | Description                                                                       |
| ------------------- | --------------------------------------------------------------------------------- |
| `assets/`           | Static assets used by the application.                                            |
| `constants/`        | Static game data, including Hanafuda cards and card combinations.                 |
| `contexts/`         | React Context providers for managing game, lobby, player, room, and socket state. |
| `pages/`            | Main application pages and route-level components.                                |
| `pages/components/` | Reusable game UI components, cards, and modals.                                   |
| `pages/lobby/`      | Lobby page and its related components.                                            |
| `utils/`            | Reusable utility functions.                                                       |
| `App.jsx`           | Main application component and routing configuration.                             |
| `GameLayout.jsx`    | Shared layout for game-related pages.                                             |
| `main.jsx`          | Frontend application entry point.                                                 |
| `index.css`         | Global styles and Tailwind CSS directives.                                        |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (compatible with Vite 7; Node.js 20.19+ or 22.12+ recommended)
- npm
- A running instance of the Hanafuda Online backend

### Installation

1. Navigate to the frontend directory:

   ```bash
   cd hanafuda-web
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend root directory:

   ```env
   VITE_WEBSOCKET_URL=http://localhost:3000
   ```

   Update the URL if your backend runs on a different host or port.

### Running the Development Server

```bash
npm run dev
```

Vite will start the development server. Open the local URL displayed in your terminal, typically:

```text
http://localhost:5173
```

## Environment Variables

| Variable             | Description                          | Example                 |
| -------------------- | ------------------------------------ | ----------------------- |
| `VITE_WEBSOCKET_URL` | URL of the backend Socket.IO server. | `http://localhost:3000` |

**Note:** Vite exposes environment variables prefixed with `VITE_` to client-side code. Do not store passwords, private API keys, or other secrets in these variables.

## Production Build

To generate the production build:

```bash
npm run build
```

The optimized application will be generated in the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## Deployment

The frontend is configured to support deployment through Vercel.

```bash
npm run deploy
```

This command runs:

```bash
vercel --prod
```

Make sure the Vercel CLI is installed and configured before deploying. Also configure the production `VITE_WEBSOCKET_URL` to point to your deployed backend server.

## Related Project

This frontend is part of the **Hanafuda Online** full-stack application.

See the repository's root README for the complete project overview and backend documentation.

---

**Built with React, Vite, Tailwind CSS, and Socket.IO.**
