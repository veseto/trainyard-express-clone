// src/levels/levelLoader.js
import { createEmptyGrid } from "../utils/utils";

export const loadLevelFromJson = async (levelName) => {
  const response = await fetch(`/levels/${levelName}.json`);
  const levelData = await response.json();

  const grid = createEmptyGrid(7);
  const trains = [];

  levelData.start?.forEach(({ row, col, color, direction }) => {
    grid[row][col] = { type: "start", color, direction };

    const colorArray = Array.isArray(color) ? color : [color];
    colorArray.forEach((clr, i) => {
      const train = {
        row,
        col,
        direction,
        color: clr,
        hasArrived: false,
        hasFailed: false,
        id: `${row}-${col}-${clr}-${i}`
      };

      if (i === 0) {
        trains.push(train); // First train is active
      } else {
        trains.push({ ...train, isQueued: true }); // Remaining are queued
      }
    });
  });

  levelData.end?.forEach(({ row, col, color, direction }) => {
    grid[row][col] = { type: "end", color, direction };
  });

  levelData.boulders?.forEach(({ row, col }) => {
    grid[row][col] = { type: "boulder" };
  });

  return { grid, trains };
};
