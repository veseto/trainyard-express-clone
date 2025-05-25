// src/levels/levelLoader.js

import { createEmptyGrid } from "../utils/utils";

export const loadLevelFromJson = async (levelName) => {
  const response = await fetch(`/levels/${levelName}.json`);
  const levelData = await response.json();

  const grid = createEmptyGrid(7);

  levelData.start?.forEach(({ row, col, color, direction }) => {
    grid[row][col] = { type: "start", color, direction };
  });

  levelData.end?.forEach(({ row, col, color, direction }) => {
    grid[row][col] = { type: "end", color, direction };
  });

  levelData.boulders?.forEach(({ row, col }) => {
    grid[row][col] = { type: "boulder" };
  });

  return { grid };
};
