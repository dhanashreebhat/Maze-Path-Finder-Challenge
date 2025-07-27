# Xaver Maze Pathfinder

A 20x20 interactive pathfinding visualizer using the A\* algorithm. Built with Next.js (App Router), React.js, Tailwind CSS, and Socket.IO.

## Project Structure

```
xaver-maze-pathfinder/
- `app/components/` – Reusable UI components like the maze `Grid`
- `app/tests/` – Unit tests using Jest + RTL
- `app/layout.jsx` – Root layout wrapper
- `app/page.jsx` – Main UI page
- `app/styles.css` – Tailwind + global styles
- `server.js` – A* logic + Socket.IO server
- `jest.config.js` – Testing configuration
- `tailwind.config.cjs` – Tailwind CSS theme
- `postcss.config.cjs` – PostCSS setup
- `package.json` – Dependencies and scripts
```

## Features

- Set Start (green), Goal (red), and Walls (black) by clicking on grid cells
- Visualizes:
  - Visited nodes (blue)
  - Shortest path (yellow)
- A\* pathfinding logic on the server
- Real-time animation via WebSocket (Socket.IO)
- Styled with Tailwind CSS
- Unit tests with Jest + React Testing Library

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

- Starts both the Next.js frontend and the backend WebSocket server at `http://localhost:3000`

## Scripts

| Command       | Description               |
| ------------- | ------------------------- |
| `npm run dev` | Starts frontend + backend |
| `npx jest`    | Runs all Jest tests       |

## Algorithm

- A\* algorithm using Manhattan Distance heuristic:
  ```
  f(n) = g(n) + h(n)
  g(n): cost from start node to n
  h(n): estimated cost from n to goal
  ```
- Implemented in `server.js` and animated in real-time

## Testing

- All unit tests are located in `/app/tests`
- Run tests using:

```bash
npx jest
```

## Architecture Overview

```
+-------------------------+         WebSocket         +--------------------------+
|   React Front-end       | <-----------------------> |   Node.js Backend Server |
| (Next.js + TailwindCSS) |    (Socket.IO stream)     | (A* pathfinding logic)   |
+-------------------------+                           +--------------------------+
         |
         | Visualizes live animation of:
         | - Visited Nodes (blue)
         | - Shortest Path (yellow)
         ↓
     Grid UI (20x20)
```

## How It Works

1. User clicks to set the Start, Goal, and draw walls on the 20x20 grid.
2. On clicking "Solve", a `POST /solve` request is sent to the server with `{ maze, start, goal }`.
3. Server runs A\* algorithm:
   - Emits each `visit` node ( blue)
   - Emits final `path` nodes ( yellow)
   - Emits `done` with `pathLength` and `visitedCount`
4. UI updates in real-time with WebSocket events.
5. On "Reset", the frontend clears the grid and state via a local reset button.

## API Endpoint

- `POST /solve`
  - Accepts JSON body with:
    ```json
    {
      "maze": [[0, 1, ...], [...]],
      "start": [x, y],
      "goal": [x, y]
    }
    ```
  - Streams progress through WebSocket
  - Responds with:
    ```json
    {
      "path": [...],
      "visitedCount": 123,
      "pathLength": 15
    }
    ```
