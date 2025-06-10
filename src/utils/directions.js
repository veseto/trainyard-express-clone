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

export const getOutgoingDirection = (trackType, incoming, mainIsFirst = true) => {
  const baseMap = {
    ho: { left: "right", right: "left" },
    ve: { up: "down", down: "up" },
    ne: { up: "right", right: "up" },
    nw: { up: "left", left: "up" },
    se: { down: "right", right: "down" },
    sw: { down: "left", left: "down" },
    in: {
      up: "down", down: "up", left: "right", right: "left"
    },
    senw: { up: "left", down: "right", left: "up", right: "down" },
    swne: { up: "right", down: "left", left: "down", right: "up" },
  };

  if (trackType.includes("+")) {
    const [first, second] = trackType.split("+");
    const primary = mainIsFirst ? first : second;
    const secondary = mainIsFirst ? second : first;

    return (
      baseMap[primary]?.[incoming] ??
      baseMap[secondary]?.[incoming] ??
      null
    );
  }

  return baseMap[trackType]?.[incoming] || null;
};
const trackDirectionMap = {
  "ho": ["left", "right"],
  "ve": ["up", "down"],
  "ne": ["down", "left"],
  "nw": ["down", "right"],
  "se": ["up", "left"],
  "sw": ["up", "right"],
  // Add more as needed
};

export const getValidDirections = (trackType) => {
  return trackDirectionMap[trackType] || [];
};

