export const oppositeDirection = (dir) => {
  const map = { up: "down", down: "up", left: "right", right: "left" };
  return map[dir];
};

export const getNextPosition = (row, col, direction) => {
  const deltas = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
  const [dRow, dCol] = deltas[direction];
  return [row + dRow, col + dCol];
};

export const getOutgoingDirection = (trackType, incomingDirection) => {
  const directionMap = {
    "straight-horizontal": { left: "right", right: "left" },
    "straight-vertical": { up: "down", down: "up" },
    "curve-se": { right: "down", down: "right" },
    "curve-sw": { left: "down", down: "left" },
    "curve-nw": { left: "up", up: "left" },
    "curve-ne": { right: "up", up: "right" },
  };

  return directionMap[trackType]?.[incomingDirection] ?? null;
};
