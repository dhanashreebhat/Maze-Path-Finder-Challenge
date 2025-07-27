import express from 'express';
import next from 'next';
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const heuristic = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

const aStar = (maze, start, goal, emitVisit = () => {}) => {
  const rows = maze.length;
  const cols = maze[0].length;

  const toKey = p => p.join(',');

  const g = {};
  const f = {};
  const open = [start];
  const cameFrom = {};

  g[toKey(start)] = 0;
  f[toKey(start)] = heuristic(start, goal);

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

  while (open.length > 0) {
    open.sort((a, b) => f[toKey(a)] - f[toKey(b)]);
    const current = open.shift();
    emitVisit(current);

    if (current[0] === goal[0] && current[1] === goal[1]) {
      const path = [];
      let cur = current;
      while (cur) {
        path.push(cur);
        cur = cameFrom[toKey(cur)];
      }
      return path.reverse();
    }

    for (const neighbor of neighbors(current)) {
      const tempG = (g[toKey(current)] ?? Infinity) + 1;

      if (tempG < (g[toKey(neighbor)] ?? Infinity)) {
        cameFrom[toKey(neighbor)] = current;
        g[toKey(neighbor)] = tempG;
        f[toKey(neighbor)] = tempG + heuristic(neighbor, goal);

        if (!open.some(p => toKey(p) === toKey(neighbor))) {
          open.push(neighbor);
        }
      }
    }
  }

  return [];
};

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = new Server(httpServer);
  server.use(bodyParser.json());

  let currentSocket = null;

  io.on('connection', socket => {
    console.log('WebSocket client connected');
    currentSocket = socket;

    socket.on('disconnect', () => {
      console.log('WebSocket client disconnected');
      currentSocket = null;
    });

    socket.on('start-pathfinding', ({ maze, start, goal }) => {
      const visited = [];

      const path = aStar(maze, start, goal, node => {
        visited.push(node);
        socket.emit('visit', node);
      });

      path.forEach((node, i) => {
        setTimeout(() => socket.emit('path', node), i * 30);
      });

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

  server.post('/solve', (req, res) => {
    const { maze, start, goal } = req.body;

    if (!maze || !start || !goal) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    if (!currentSocket) {
      return res.status(500).json({ error: 'No WebSocket client connected' });
    }

    const visited = [];

    const path = aStar(maze, start, goal, node => {
      visited.push(node);
      currentSocket.emit('visit', node);
    });

    path.forEach((node, i) => {
      setTimeout(() => currentSocket.emit('path', node), i * 30);
    });

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

    res.status(200).json({
      message: 'Solving started',
      path,
      pathLength: path.length,
      visitedCount: visited.length,
    });
  });

  server.all('*', (req, res) => handle(req, res));
  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Server ready on http://localhost:${PORT}`);
  });
});
