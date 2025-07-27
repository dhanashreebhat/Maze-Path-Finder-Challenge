'use client';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Grid Component
 * Renders a 20x20 interactive grid representing a maze.
 * Allows user to set start and goal points, draw walls, and view visited and path cells.
 */
const Grid = ({ maze, setMaze, start, setStart, goal, setGoal, path, visited }) => {
  // handleClick – Handles user interaction on each cell
  //- First click sets the start point (green)
  //- Second click sets the goal point (red)
  //- Further clicks toggle wall cells (black)

  const handleClick = (i, j) => {
    const isStart = start && start[0] === i && start[1] === j;
    const isGoal = goal && goal[0] === i && goal[1] === j;
    const isVisited = visited.some(p => p[0] === i && p[1] === j);
    const isPath = path.some(p => p[0] === i && p[1] === j);

    if (!start) {
      // Set start point (only on free space)
      if (maze[i][j] === 1) return;
      setStart([i, j]);
    } else if (!goal) {
      // Set goal point (only on free space)
      if (maze[i][j] === 1) return;
      setGoal([i, j]);
    } else {
      // Toggle wall if not start, goal, visited, or path
      if (isStart || isGoal || isVisited || isPath) return;
      const updated = maze.map(row => [...row]);
      updated[i][j] = updated[i][j] === 1 ? 0 : 1;
      setMaze(updated);
    }
  };

  return (
    <div
      className="grid gap-[2px] perspective-[600px]" // creates 20x20 grid with 3D perspective
      style={{ gridTemplateColumns: 'repeat(20, 1fr)' }}
    >
      {maze.map((row, i) =>
        row.map((cell, j) => {
          // Determine cell roles
          const isStart = start && start[0] === i && start[1] === j;
          const isGoal = goal && goal[0] === i && goal[1] === j;
          const isPath = path.some(p => p[0] === i && p[1] === j);
          const isVisited = visited.some(p => p[0] === i && p[1] === j);

          // Set base color based on cell state
          let color = 'bg-white';
          if (cell === 1) color = 'bg-black'; // Wall
          if (isVisited) color = 'bg-blue-300'; // Visited node
          if (isPath) color = 'bg-yellow-300'; // Final path
          if (isGoal) color = 'bg-red-500'; // Goal
          if (isStart) color = 'bg-green-500'; // Start

          return (
            <div
              key={`${i}-${j}`} // Unique key per cell
              data-testid="grid-cell" // For testing
              onClick={() => handleClick(i, j)} // Cell interaction
              className={`w-5 h-5 border border-gray-400 transition-all duration-200 ${color}`}
              style={{
                boxShadow: '3px 3px 6px rgba(0,0,0,0.3)', // Soft shadow
              }}
            />
          );
        })
      )}
    </div>
  );
};
// Props for managing maze state, pathfinding input (start/goal), and A* algorithm output (visited/path)
Grid.propTypes = {
  maze: PropTypes.array.isRequired,
  setMaze: PropTypes.func.isRequired,
  start: PropTypes.array,
  setStart: PropTypes.func,
  goal: PropTypes.array,
  setGoal: PropTypes.func,
  path: PropTypes.array,
  visited: PropTypes.array,
};

export default Grid;
