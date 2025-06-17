import {
  getNextPosition,
  getOutgoingDirection,
  oppositeDirection
} from "./directions";
import { mixColors } from "./mixColors";

export const createEmptyGrid = (size = 7) =>
  Array.from({ length: size }, () => Array.from({ length: size }, () => null));

export const moveTrain = ({ train, grid }) => {
  const { row, col, direction, color } = train;
  const [nextRow, nextCol] = getNextPosition(row, col, direction);

  // Out of bounds = fail
  if (
    nextRow < 0 || nextRow >= grid.length ||
    nextCol < 0 || nextCol >= grid[0].length
  ) {
    return { updatedTrain: { ...train, hasFailed: true }, toggleCell: null, outgoingDirection: null };
  }

  const targetCell = grid[nextRow][nextCol];
  const incoming = oppositeDirection(direction);

  // No cell or boulder = fail
  if (!targetCell || targetCell.type === "boulder") {
    return { updatedTrain: { ...train, hasFailed: true }, toggleCell: null, outgoingDirection: null };
  }

  // End cell logic
  if (targetCell.type === "end") {
    const allowedDirections = Array.isArray(targetCell.direction)
      ? targetCell.direction
      : [targetCell.direction];
    const allowedColors = Array.isArray(targetCell.color)
      ? targetCell.color
      : [targetCell.color];

    if (allowedDirections.includes(incoming) && allowedColors.includes(color)) {
      // Train arrives, no outgoing direction
      return {
        updatedTrain: { ...train, row: nextRow, col: nextCol, hasArrived: true },
        toggleCell: null,
        outgoingDirection: null,
      };
    } else {
      return { updatedTrain: { ...train, hasFailed: true }, toggleCell: null, outgoingDirection: null };
    }
  }

  // Track logic
  if (targetCell.type === "track") {
    const { trackType } = targetCell;

    if (trackType.includes("+")) {
      const [trackA, trackB] = trackType.split("+");
      const mainIsFirst = targetCell.mainIsFirst !== false;
      const toggleState = !!targetCell._toggle;

      // Determine which track is main/alt depending on toggleState and mainIsFirst
      const mainTrack = toggleState
        ? (mainIsFirst ? trackA : trackB)
        : (mainIsFirst ? trackB : trackA);

      const altTrack = toggleState
        ? (mainIsFirst ? trackB : trackA)
        : (mainIsFirst ? trackA : trackB);

      const mainSupports = getOutgoingDirection(mainTrack, incoming);
      const altSupports = getOutgoingDirection(altTrack, incoming);

      if (mainSupports) {
        return {
          updatedTrain: {
            ...train,
            row: nextRow,
            col: nextCol,
            direction: mainSupports,
          },
          toggleCell: {
            row: nextRow,
            col: nextCol,
            newToggle: !toggleState,
          },
          outgoingDirection: mainSupports,
        };
      }

      if (altSupports) {
        return {
          updatedTrain: {
            ...train,
            row: nextRow,
            col: nextCol,
            direction: altSupports,
          },
          toggleCell: {
            row: nextRow,
            col: nextCol,
            newToggle: !toggleState,
          },
          outgoingDirection: altSupports,
        };
      }

      // No supported outgoing => fail
      return { updatedTrain: { ...train, hasFailed: true }, toggleCell: null, outgoingDirection: null };
    } else {
      // Single track
      const outgoing = getOutgoingDirection(trackType, incoming);
      if (outgoing) {
        return {
          updatedTrain: { ...train, row: nextRow, col: nextCol, direction: outgoing },
          toggleCell: null,
          outgoingDirection: outgoing,
        };
      }
    }
  }
  
  // Unknown cell type or no valid move = fail
  return { updatedTrain: { ...train, hasFailed: true }, toggleCell: null, outgoingDirection: null };
};

export function mergeTrains({ trains, grid }) {
  const mergedTrains = [];
  const trainMap = new Map();

  // Group trains by position
  for (const train of trains) {
    if (train.hasArrived || train.hasFailed || train.isQueued) {
      mergedTrains.push(train);
      continue;
    }

    const key = `${train.row},${train.col}`;
    if (!trainMap.has(key)) trainMap.set(key, []);
    trainMap.get(key).push(train);
  }

  for (const [pos, trainsAtPos] of trainMap.entries()) {
    const [rowStr, colStr] = pos.split(",");
    const row = parseInt(rowStr, 10);
    const col = parseInt(colStr, 10);
    const cell = grid[row][col];

    if (!cell || cell.type !== "track") {
      mergedTrains.push(...trainsAtPos);
      continue;
    }

    if (cell.trackType.includes("+")) {
      // Merge by outgoing direction
      const groups = new Map();
      for (const t of trainsAtPos) {
        const dir = t.outgoingDirection || "unknown";
        if (!groups.has(dir)) groups.set(dir, []);
        groups.get(dir).push(t);
      }

      for (const group of groups.values()) {
        if (group.length === 1) {
          mergedTrains.push(group[0]);
        } else {
          const mixedColor = group.reduce((acc, t) => mixColors(acc, t.color), group[0].color);
          mergedTrains.push({ ...group[0], color: mixedColor, hasArrived: false, hasFailed: false });
        }
      }
    } else if (
      ["in", "ve", "ho", "ne", "nw", "se", "sw"].includes(cell.trackType) &&
      trainsAtPos.length > 1
    ) {
      const mixedColor = trainsAtPos.reduce((acc, t) => mixColors(acc, t.color), trainsAtPos[0].color);
      for (const t of trainsAtPos) {
        mergedTrains.push({ ...t, color: mixedColor });
      }
    } else {
      mergedTrains.push(...trainsAtPos);
    }
  }

  return mergedTrains;
}
