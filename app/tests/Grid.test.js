import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Grid from '../components/Grid';

describe('Grid Component – Main Tests', () => {
  let maze, setMaze, setStart, setGoal;

  beforeEach(() => {
    maze = Array(20)
      .fill()
      .map(() => Array(20).fill(0));
    setMaze = jest.fn();
    setStart = jest.fn();
    setGoal = jest.fn();
  });

  //  Render check: 400 cells (20x20 grid)
  test('renders 400 cells', () => {
    const { container } = render(
      <Grid
        maze={maze}
        setMaze={setMaze}
        setStart={setStart}
        setGoal={setGoal}
        start={null}
        goal={null}
        path={[]}
        visited={[]}
      />
    );
    expect(container.querySelectorAll('[data-testid="grid-cell"]').length).toBe(400);
  });

  // First click sets the start point
  test('first click sets start', () => {
    const { container } = render(
      <Grid
        maze={maze}
        setMaze={setMaze}
        setStart={setStart}
        setGoal={setGoal}
        start={null}
        goal={null}
        path={[]}
        visited={[]}
      />
    );
    fireEvent.click(container.querySelector('[data-testid="grid-cell"]'));
    expect(setStart).toHaveBeenCalled();
  });

  // Second click sets the goal point
  test('second click sets goal', () => {
    const { container } = render(
      <Grid
        maze={maze}
        setMaze={setMaze}
        setStart={setStart}
        setGoal={setGoal}
        start={[0, 0]}
        goal={null}
        path={[]}
        visited={[]}
      />
    );
    fireEvent.click(container.querySelectorAll('[data-testid="grid-cell"]')[1]);
    expect(setGoal).toHaveBeenCalled();
  });

  // Renders correct colors for start, goal, wall, path, visited
  test('renders colors correctly for all states', () => {
    const wallMaze = maze.map(row => [...row]);
    wallMaze[3][3] = 1;
    const visited = [[4, 4]];
    const path = [[5, 5]];
    const { container } = render(
      <Grid
        maze={wallMaze}
        setMaze={setMaze}
        setStart={setStart}
        setGoal={setGoal}
        start={[1, 1]}
        goal={[2, 2]}
        path={path}
        visited={visited}
      />
    );
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument(); // Start
    expect(container.querySelector('.bg-red-500')).toBeInTheDocument(); // Goal
    expect(container.querySelector('.bg-black')).toBeInTheDocument(); // Wall
    expect(container.querySelector('.bg-blue-300')).toBeInTheDocument(); // Visited
    expect(container.querySelector('.bg-yellow-300')).toBeInTheDocument(); // Path
  });

  //  Third click toggles wall
  test('further clicks toggle wall', () => {
    const { container } = render(
      <Grid
        maze={maze}
        setMaze={setMaze}
        setStart={setStart}
        setGoal={setGoal}
        start={[0, 0]}
        goal={[0, 1]}
        path={[]}
        visited={[]}
      />
    );
    fireEvent.click(container.querySelectorAll('[data-testid="grid-cell"]')[2]);
    expect(setMaze).toHaveBeenCalled();
  });
});
