'use client';

import React, { useState, useEffect } from 'react';
import Grid from './components/Grid';
import { io } from 'socket.io-client';

// WebSocket connection to backend server
const socket = io('http://localhost:3000');

const Home = () => {
  // Set page title on mount
  useEffect(() => {
    document.title = 'Xaver-Maze Pathfinder';
  }, []);

  // Initialize 20x20 maze grid (0 = empty, 1 = wall)
  const [maze, setMaze] = useState(
    Array(20)
      .fill()
      .map(() => Array(20).fill(0))
  );

  // Start and goal point coordinates
  const [start, setStart] = useState(null);
  const [goal, setGoal] = useState(null);

  // Stores final shortest path and visited nodes for animation
  const [path, setPath] = useState([]);
  const [visited, setVisited] = useState([]);

  // Current status text displayed to the user
  const [status, setStatus] = useState('Waiting...');

  // WebSocket event handlers: listen for visit and done messages
  useEffect(() => {
    let intervalId = null;

    // When a cell is visited, add it to visited array
    socket.on('visit', node => {
      setVisited(prev => [...prev, node]);
    });

    // // When pathfinding is complete, set the final path and update status
    // socket.on("done", ({ path }) => {
    //   clearInterval(intervalId);
    //   setPath(path);
    //   setStatus("Solved");
    // });

    socket.on('done', ({ path, pathLength }) => {
      clearInterval(intervalId);
      setPath(path);
      setVisited(prev => [...prev]); // Ensure re-render if needed

      if (pathLength === 0) {
        setStatus(' Path not found');
      } else {
        setStatus(' Path found ');
      }
    });

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      socket.off('visit');
      socket.off('done');
    };
  }, []);

  // Sends maze, start, and goal to the backend via REST to trigger A*
  const handleSolve = async () => {
    if (!start || !goal) {
      alert('Please set both START and GOAL points.');
      return;
    }

    // Reset state before solving
    setPath([]);
    setVisited([]);
    setStatus('Solving...');

    try {
      const response = await fetch('http://localhost:3000/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maze, start, goal }),
      });

      if (!response.ok) throw new Error('Failed to start pathfinding');
    } catch (err) {
      console.error('Error solving maze:', err);
      setStatus('Error occurred');
    }
  };

  // Resets maze, path, visited nodes, and start/goal points
  const handleReset = () => {
    setMaze(
      Array(20)
        .fill()
        .map(() => Array(20).fill(0))
    );
    setStart(null);
    setGoal(null);
    setPath([]);
    setVisited([]);
    setStatus('Waiting...');
  };

  return (
    <main className="p-4 max-w-screen-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Maze Pathfinder</h1>

      {/* Maze Grid */}
      <Grid
        maze={maze}
        setMaze={setMaze}
        start={start}
        setStart={setStart}
        goal={goal}
        setGoal={setGoal}
        path={path}
        visited={visited}
      />

      {/* Control Buttons */}
      <div className="flex gap-4 justify-center mt-4">
        <button
          onClick={handleSolve}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Solve
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </div>

      {/* Display Status, Path Length, and Visited Node Count */}
      <div className="mt-4 text-sm text-gray-700 text-center">
        <p>
          <span className="font-bold">Status:</span> {status}
        </p>
        <p>
          <span className="font-bold">Path length:</span> {path.length}
        </p>
        <p>
          <span className="font-bold">Visited nodes:</span> {visited.length}
        </p>
      </div>
    </main>
  );
};

export default Home;
