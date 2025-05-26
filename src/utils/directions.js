// utils/directions.js

export const oppositeDirection = (dir) => {
  const opposites = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
  };
  return opposites[dir];
};

export const getNextPosition = (row, col, direction) => {
  switch (direction) {
    case "up":
      return [row - 1, col];
    case "down":
      return [row + 1, col];
    case "left":
      return [row, col - 1];
    case "right":
      return [row, col + 1];
    default:
      return [row, col];
  }
};

export const getOutgoingDirection = (trackType, incoming) => {
  const map = {
    "straight-horizontal": {
      left: "right",
      right: "left",
    },
    "straight-vertical": {
      up: "down",
      down: "up",
    },
    "curve-ne": {
      up: "right",
      right: "up",
    },
    "curve-nw": {
      up: "left",
      left: "up",
    },
    "curve-se": {
      down: "right",
      right: "down",
    },
    "curve-sw": {
      down: "left",
      left: "down",
    },
    "intersection": {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    },
  };

  return map[trackType]?.[incoming] || null;
};

