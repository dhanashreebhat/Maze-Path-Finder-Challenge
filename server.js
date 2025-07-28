import express from 'express';
import next from 'next';
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
// Manhattan distance heuristic for A* algorithm
const heuristic = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
// A* pathfinding algorithm
const aStar = (maze, start, goal, emitVisit = () => {}) => {
  const rows = maze.length;
  const cols = maze[0].length;

  const toKey = p => p.join(','); // Converts [x, y] to string key

  const g = {}; // Cost from start to node
  const f = {}; // Total cost estimate (g + heuristic)
  const open = [start]; // Open set (nodes to explore)
  const cameFrom = {}; // Map for path reconstruction

  g[toKey(start)] = 0;
  f[toKey(start)] = heuristic(start, goal);
  // Get valid neighboring cells (no walls, in bounds)
  const neighbors = ([x, y]) => {
    return [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ]
      .map(([dx, dy]) => [x + dx, y + dy])
      .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < rows && ny < cols && maze[nx][ny] !== 1);
  };
  // Main loop: while nodes remain in open set
  while (open.length > 0) {
    open.sort((a, b) => f[toKey(a)] - f[toKey(b)]); // Sort by lowest f score
    const current = open.shift(); // Get node with lowest cost
    emitVisit(current); // Send visited node (for animation)
    // Goal reached → reconstruct path
    if (current[0] === goal[0] && current[1] === goal[1]) {
      const path = [];
      let cur = current;
      while (cur) {
        path.push(cur);
        cur = cameFrom[toKey(cur)];
      }
      return path.reverse(); // Return path from start to goal
    }
    // Explore neighbors
    for (const neighbor of neighbors(current)) {
      const tempG = (g[toKey(current)] ?? Infinity) + 1;

      if (tempG < (g[toKey(neighbor)] ?? Infinity)) {
        cameFrom[toKey(neighbor)] = current;
        g[toKey(neighbor)] = tempG;
        f[toKey(neighbor)] = tempG + heuristic(neighbor, goal);
        // Add neighbor if not already in open set
        if (!open.some(p => toKey(p) === toKey(neighbor))) {
          open.push(neighbor);
        }
      }
    }
  }

  return []; // No path found
};
// Start server after Next.js
app.prepare().then(() => {
  const server = express(); // Express instance
  const httpServer = http.createServer(server); // HTTP server
  const io = new Server(httpServer); // Socket.IO instance
  server.use(bodyParser.json());

  let currentSocket = null; // Keep track of connected WebSocket client
  // WebSocket connection handler
  io.on('connection', socket => {
    console.log('WebSocket client connected');
    currentSocket = socket;

    socket.on('disconnect', () => {
      console.log('WebSocket client disconnected');
      currentSocket = null;
    });
    // Optional: handle pathfinding directly over WebSocket
    socket.on('start-pathfinding', ({ maze, start, goal }) => {
      const visited = [];

      const path = aStar(maze, start, goal, node => {
        visited.push(node);
        socket.emit('visit', node); // Send visited node
      });
      // Animate final path by emitting each node with delay
      path.forEach((node, i) => {
        setTimeout(() => socket.emit('path', node), i * 30);
      });

      // Emit completion and summary
      setTimeout(
        () => {
          socket.emit('done', {
            path,
            pathLength: path.length,
            visitedCount: visited.length,
          });
        },
        path.length * 30 + 100
      );
    });
  });
  // HTTP POST endpoint for triggering pathfinding
  server.post('/solve', (req, res) => {
    const { maze, start, goal } = req.body;
    // Validate input
    if (!maze || !start || !goal) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    // Ensure a WebSocket client is connected
    if (!currentSocket) {
      return res.status(500).json({ error: 'No WebSocket client connected' });
    }

    const visited = [];

    const path = aStar(maze, start, goal, node => {
      visited.push(node);
      currentSocket.emit('visit', node);
    });
    // Emit path with delay (for animation effect)
    path.forEach((node, i) => {
      setTimeout(() => currentSocket.emit('path', node), i * 30);
    });
    // Emit 'done' event after path is fully sent
    setTimeout(
      () => {
        currentSocket.emit('done', {
          path,
          pathLength: path.length,
          visitedCount: visited.length,
        });
      },
      path.length * 30 + 100
    );
    // Pass all other requests to Next.js handler
    res.status(200).json({
      message: 'Solving started',
      path,
      pathLength: path.length,
      visitedCount: visited.length,
    });
  });

  // Pass all other requests to Next.js handler
  server.all('*', (req, res) => handle(req, res));
  // Start server
  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Server ready on http://localhost:${PORT}`);
  });
});
