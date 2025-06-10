import {
  getNextPosition,
  getOutgoingDirection,
  oppositeDirection
} from "./directions";

export const createEmptyGrid = (size = 7) =>
  Array.from({ length: size }, () => Array.from({ length: size }, () => null));

export const moveTrain = ({ train, grid }) => {
  const { row, col, direction, color } = train;
  const [nextRow, nextCol] = getNextPosition(row, col, direction);

  if (
    nextRow < 0 || nextRow >= grid.length ||
    nextCol < 0 || nextCol >= grid[0].length
  ) {
    return { updatedTrain: { ...train, hasFailed: true }, toggleCell: null };
  }

  const targetCell = grid[nextRow][nextCol];
  const incoming = oppositeDirection(direction);

  if (!targetCell || targetCell.type === "boulder") {
    return { updatedTrain: { ...train, hasFailed: true }, toggleCell: null };
  }

  if (targetCell.type === "end") {
    const allowedDirections = Array.isArray(targetCell.direction)
      ? targetCell.direction
      : [targetCell.direction];
    const allowedColors = Array.isArray(targetCell.color)
      ? targetCell.color
      : [targetCell.color];

    if (allowedDirections.includes(incoming) && allowedColors.includes(color)) {
      return {
        updatedTrain: { ...train, row: nextRow, col: nextCol, hasArrived: true },
        toggleCell: null
      };
    } else {
      return { updatedTrain: { ...train, hasFailed: true }, toggleCell: null };
    }
  }

  if (targetCell.type === "track") {
    const { trackType } = targetCell;

    if (trackType.includes("+")) {
      const [trackA, trackB] = trackType.split("+");
      const mainIsFirst = targetCell.mainIsFirst !== false;
      const toggleState = !!targetCell._toggle;

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
            direction: mainSupports
          },
          toggleCell: {
            row: nextRow,
            col: nextCol,
            newToggle: !toggleState
          }
        };
      }

      if (altSupports) {
        return {
          updatedTrain: {
            ...train,
            row: nextRow,
            col: nextCol,
            direction: altSupports
          },
          toggleCell: {
            row: nextRow,
            col: nextCol,
            newToggle: !toggleState
          }
        };
      }

    } else {
      const outgoing = getOutgoingDirection(trackType, incoming);
      if (outgoing) {
        return {
          updatedTrain: { ...train, row: nextRow, col: nextCol, direction: outgoing },
          toggleCell: null
        };
      }
    }
  }

  return { updatedTrain: { ...train, hasFailed: true }, toggleCell: null };
};
