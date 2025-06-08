import {
  getNextPosition,
  getOutgoingDirection,
  oppositeDirection
} from "./directions";

export const createEmptyGrid = (size = 7) =>
  Array.from({ length: size }, () => Array.from({ length: size }, () => null));

export const moveTrain = ({ train, grid, setTrain, setGrid }) => {
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
    const { trackType } = targetCell;

    if (trackType.includes("+")) {
      const [first, second] = trackType.split("+");
      const mainFirst = targetCell.mainIsFirst !== false;

      // Determine direction from current toggle state
      const useFirst = targetCell._toggle !== false; // default true
      const currentType = useFirst
        ? (mainFirst ? first : second)
        : (mainFirst ? second : first);

      const outgoing = getOutgoingDirection(currentType, incoming);

      if (outgoing) {
        // Clone grid to trigger re-render
        const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

        // Toggle state and update visual flag
        newGrid[nextRow][nextCol]._toggle = !useFirst;
        newGrid[nextRow][nextCol].mainIsFirst = !useFirst;

        setGrid(newGrid);
        setTrain({ ...train, row: nextRow, col: nextCol, direction: outgoing });
        return;
      }
    } else {
      const outgoing = getOutgoingDirection(trackType, incoming);
      if (outgoing) {
        setTrain({ ...train, row: nextRow, col: nextCol, direction: outgoing });
        return;
      }
    }
  }

  setTrain({ ...train, hasFailed: true });
};

