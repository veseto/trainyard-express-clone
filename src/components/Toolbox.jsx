// src/components/Toolbox.jsx
import React from "react";
import levelIndex from "../levels/levelIndex";

const Toolbox = ({ handleRun, loadLevel, setIsRunning, onLevelChange, handleTestAllLevels }) => {
  const levelNames = Object.keys(levelIndex);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="px-4 py-2 bg-purple-500 text-white rounded"
        onClick={handleRun}
      >
        Run
      </button>
      <button
        className="px-4 py-2 bg-gray-700 text-white rounded"
        onClick={() => {
          setIsRunning(false);
          loadLevel();
        }}
      >
        Reset
      </button>

      <select
        className="px-4 py-2 rounded border border-gray-300"
        onChange={(e) => {
          setIsRunning(false);
          onLevelChange(e.target.value);
        }}
      >
        {levelNames.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>

      {/* New Test All Levels Button */}
      <button
        className="px-4 py-2 bg-green-600 text-white rounded"
        onClick={handleTestAllLevels}
      >
        Test All Levels
      </button>
    </div>
  );
};

const handleTestAllLevels = async () => {
  setIsRunning(false);
  setStatus("testing...");
  setLevelFailed(false);

  const results = [];

  for (const levelKey of Object.keys(levelIndex)) {
    // Load level grid and trains
    const { grid: loadedGrid, trains: loadedTrains } = await loadLevelFromJson(levelKey);

    let trains = loadedTrains.map(t => ({ ...t }));
    let gridCopy = loadedGrid.map(row => row.map(cell => (cell ? { ...cell } : null)));

    let step = 0;
    const maxSteps = 1000; // safety to avoid infinite loop

    let levelStatus = "running";

    while (step < maxSteps && levelStatus === "running") {
      step++;

      // Similar logic to your main loop's interval callback but synchronous
      let anyFailed = false;
      let allArrived = false;
      const arrivedAtEnds = new Map();
      const trainMap = new Map();

      const updatedGrid = gridCopy.map(row => row.map(cell => (cell ? { ...cell } : null)));
      const nextTrains = [];

      for (const train of trains) {
        if (train.hasArrived || train.hasFailed || train.isQueued) {
          nextTrains.push(train);
          if (train.hasFailed) anyFailed = true;
          continue;
        }

        const { updatedTrain, toggleCell, outgoingDirection } = moveTrain({ train, grid: updatedGrid });

        if (toggleCell) {
          const { row, col, newToggle } = toggleCell;
          updatedGrid[row][col]._toggle = newToggle;
        }

        updatedTrain.outgoingDirection = outgoingDirection;

        if (updatedTrain.hasArrived) {
          const key = `${updatedTrain.row},${updatedTrain.col}`;
          if (!arrivedAtEnds.has(key)) {
            arrivedAtEnds.set(key, []);
          }
          arrivedAtEnds.get(key).push(updatedTrain);
        }

        if (updatedTrain.hasFailed) anyFailed = true;

        if (!updatedTrain.isQueued) {
          const key = `${updatedTrain.row},${updatedTrain.col}`;
          if (trainMap.has(key)) {
            trainMap.get(key).push(updatedTrain);
          } else {
            trainMap.set(key, [updatedTrain]);
          }
        }

        nextTrains.push(updatedTrain);
      }

      // Merge trains logic (reuse from your main loop)
      const mergedTrains = [];

      for (const [pos, trainsAtPos] of trainMap.entries()) {
        const [rowStr, colStr] = pos.split(",");
        const row = parseInt(rowStr, 10);
        const col = parseInt(colStr, 10);
        const cell = updatedGrid[row][col];

        if (cell?.type !== "track") {
          mergedTrains.push(...trainsAtPos);
          continue;
        }

        if (cell.trackType.includes("+")) {
          const groups = new Map();

          for (const t of trainsAtPos) {
            const dir = t.outgoingDirection || "unknown";
            if (!groups.has(dir)) groups.set(dir, []);
            groups.get(dir).push(t);
          }

          for (const [dir, groupTrains] of groups.entries()) {
            if (groupTrains.length === 1) {
              mergedTrains.push(groupTrains[0]);
            } else {
              const mixedColor = groupTrains.reduce((acc, t) => mixColors(acc, t.color), groupTrains[0].color);
              const baseTrain = groupTrains[0];
              mergedTrains.push({
                ...baseTrain,
                color: mixedColor,
                hasArrived: false,
                hasFailed: false,
              });
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

      for (const train of nextTrains) {
        if (train.isQueued) {
          mergedTrains.push(train);
        }
      }

      // Validate arrivals at end cells
      for (const [key, arrivedTrains] of arrivedAtEnds.entries()) {
        const [rowStr, colStr] = key.split(",");
        const row = parseInt(rowStr, 10);
        const col = parseInt(colStr, 10);
        const endCell = updatedGrid[row][col];

        if (endCell?.type === "end") {
          const expectedColors = Array.isArray(endCell.color) ? endCell.color : [endCell.color];
          const arrivedColors = arrivedTrains.map((t) => t.color);

          if (!arraysMatchMultiset(expectedColors, arrivedColors)) {
            arrivedTrains.forEach((t) => {
              t.hasFailed = true;
            });
            anyFailed = true;
          }
        }
      }

      // Move queued trains
      const startsActivated = new Set();
      const finalTrains = [];

      for (const train of mergedTrains) {
        if (train.isQueued && !train.hasArrived && !train.hasFailed) {
          const key = `${train.row},${train.col}`;
          if (!startsActivated.has(key)) {
            finalTrains.push({ ...train, isQueued: false });
            startsActivated.add(key);
          } else {
            finalTrains.push(train);
          }
        } else {
          finalTrains.push(train);
        }
      }

      trains = finalTrains;
      gridCopy = updatedGrid;

      allArrived = trains.length > 0 && trains.every(t => t.hasArrived);

      if (anyFailed) {
        levelStatus = "failed";
      } else if (allArrived) {
        levelStatus = "success";
      }
    } // end while

    results.push({ level: levelKey, status: levelStatus, steps: step });
  }

  setStatus("idle");
  console.table(results);
};

export default Toolbox;
