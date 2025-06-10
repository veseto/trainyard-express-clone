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
