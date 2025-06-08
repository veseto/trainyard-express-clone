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
      const [trackA, trackB] = trackType.split("+");
      const mainIsFirst = targetCell.mainIsFirst !== false;
      const toggleState = targetCell._toggle !== false;

      const mainTrack = toggleState ? (mainIsFirst ? trackA : trackB)
                                    : (mainIsFirst ? trackB : trackA);
      const altTrack  = toggleState ? (mainIsFirst ? trackB : trackA)
                                    : (mainIsFirst ? trackA : trackB);

      const mainSupports = getOutgoingDirection(mainTrack, incoming);
      const altSupports  = getOutgoingDirection(altTrack, incoming);

      let outgoing = null;
      let usedTrack = null;

      if (mainSupports && altSupports) {
        // Both paths support entry — choose based on toggle
        outgoing = getOutgoingDirection(mainTrack, incoming);
        usedTrack = mainTrack;
      } else if (mainSupports) {
        outgoing = mainSupports;
        usedTrack = mainTrack;
      } else if (altSupports) {
        outgoing = altSupports;
        usedTrack = altTrack;
      }

      if (outgoing) {
        const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

        // Only toggle if both tracks support the same entrance
        const shouldToggle = mainSupports && altSupports;

        if (shouldToggle) {
          newGrid[nextRow][nextCol]._toggle = !toggleState;
        }

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
