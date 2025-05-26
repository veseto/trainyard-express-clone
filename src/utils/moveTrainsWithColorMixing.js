import { getNextPosition, getOutgoingDirection, oppositeDirection } from "./directions";
import { mixColors } from "./mixColors";

export function moveTrainsWithColorMixing(trains, grid) {
  const movedTrains = [];
  const cellOccupancy = new Map();

  // First phase: compute next positions
  for (const train of trains) {
    if (train.hasArrived || train.hasFailed) {
      movedTrains.push(train);
      continue;
    }

    const [nextRow, nextCol] = getNextPosition(train.row, train.col, train.direction);
    const key = `${nextRow},${nextCol}`;
    const entry = cellOccupancy.get(key) || [];
    entry.push({ ...train, nextRow, nextCol });
    cellOccupancy.set(key, entry);
  }

  const updatedTrains = [];

  for (const [key, entries] of cellOccupancy.entries()) {
    const [row, col] = key.split(",").map(Number);
    const cell = grid[row]?.[col];

    if (!cell || cell.type === "boulder") {
      entries.forEach(t => updatedTrains.push({ ...t, hasFailed: true }));
      continue;
    }

    if (cell.type === "end") {
      entries.forEach(t => {
        const allowedDirs = Array.isArray(cell.direction) ? cell.direction : [cell.direction];
        const allowedColors = Array.isArray(cell.color) ? cell.color : [cell.color];
        const incoming = oppositeDirection(t.direction);
        if (allowedDirs.includes(incoming) && allowedColors.includes(t.color)) {
          updatedTrains.push({ ...t, row, col, hasArrived: true });
        } else {
          updatedTrains.push({ ...t, hasFailed: true });
        }
      });
      continue;
    }

    if (cell.type === "track") {
      if (cell.trackType === "intersection" && entries.length > 1) {
        // Color mix
        const mixedColor = entries.map(e => e.color).reduce(mixColors);
        entries.forEach(t => {
          updatedTrains.push({
            ...t,
            row,
            col,
            color: mixedColor // Color changes, direction stays the same
          });
        });
      } else {
        entries.forEach(t => {
          const incoming = oppositeDirection(t.direction);
          const outgoing = getOutgoingDirection(cell.trackType, incoming);
          if (outgoing) {
            updatedTrains.push({ ...t, row, col, direction: outgoing });
          } else {
            updatedTrains.push({ ...t, hasFailed: true });
          }
        });
      }
    } else {
      entries.forEach(t => updatedTrains.push({ ...t, hasFailed: true }));
    }
  }

  const anyFailed = updatedTrains.some(t => t.hasFailed);
  const allArrived = updatedTrains.every(t => t.hasArrived);

  return { updatedTrains, anyFailed, allArrived };
}
