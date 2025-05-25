import {
  getNextPosition,
  getOutgoingDirection,
  oppositeDirection
} from "./directions";

export const createEmptyGrid = (size = 7) =>
  Array.from({ length: size }, () => Array.from({ length: size }, () => null));

export const moveTrain = ({ train, grid, setTrain }) => {
  const { row, col, direction, color } = train;
  const [nextRow, nextCol] = getNextPosition(row, col, direction);

  if (
    nextRow < 0 || nextRow >= grid.length ||
    nextCol < 0 || nextCol >= grid[0].length
  ) {
    setTrain({ ...train, hasFailed: true });
    return;
  }

  const targetCell = grid[nextRow][nextCol];
  const incoming = oppositeDirection(direction);

  if (!targetCell || targetCell.type === "boulder") {
    setTrain({ ...train, hasFailed: true });
    return;
  }

  if (targetCell.type === "end") {
  const allowedDirections = Array.isArray(targetCell.direction)
    ? targetCell.direction
    : [targetCell.direction];

  const allowedColors = Array.isArray(targetCell.color)
    ? targetCell.color
    : [targetCell.color];

  if (allowedDirections.includes(incoming) && allowedColors.includes(color)) {
    setTrain({ ...train, row: nextRow, col: nextCol, hasArrived: true });
  } else {
    setTrain({ ...train, hasFailed: true });
  }
  return;
}


  if (targetCell.type === "track") {
    const outgoing = getOutgoingDirection(targetCell.trackType, incoming);
    if (outgoing) {
      setTrain({ ...train, row: nextRow, col: nextCol, direction: outgoing });
      return;
    }
  }

  setTrain({ ...train, hasFailed: true });
};
