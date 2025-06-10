import React, { useState, useEffect, useRef } from "react";
import Grid from "./components/Grid";
import Toolbox from "./components/Toolbox";
import { createEmptyGrid, moveTrain } from "./utils/utils";
import { loadLevelFromJson } from "./levels/levelLoader";
import { mixColors } from "./utils/mixColors";

const GRID_SIZE = 7;

const TrainyardGame = () => {
  const [grid, setGrid] = useState(createEmptyGrid(GRID_SIZE));
  const [trains, setTrains] = useState([]);
  const initialTrainsRef = useRef([]);
  const [selectedTool, setSelectedTool] = useState({ type: "track", trackType: "straight-horizontal" });
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("idle");
  const [currentLevel, setCurrentLevel] = useState("level-14");
  const [levelFailed, setLevelFailed] = React.useState(false);

  const resetLevel = async (level = currentLevel) => {
    const { grid: loadedGrid, trains: loadedTrains } = await loadLevelFromJson(level);
    setGrid(loadedGrid);
    setTrains(loadedTrains);
    initialTrainsRef.current = loadedTrains; // Save initial trains for reset
    setStatus("idle");
    setIsRunning(false);
    setLevelFailed(false);
  };

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
  setTrains((prevTrains) => {
    let anyFailed = false;
    // We'll determine allArrived *after* merging trains
    // so start assuming false, set true later if conditions met
    let allArrived = false;

    let updatedGrid = grid.map((row) => row.map((cell) => ({ ...cell }))); // deep clone grid

    const trainMap = new Map();
    const arrivedAtEnds = new Map();

    const nextTrains = [];

    // Move all trains, collect outgoingDirection for merging
    for (const train of prevTrains) {
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

      const key = `${updatedTrain.row},${updatedTrain.col}`;
      if (trainMap.has(key)) {
        trainMap.get(key).push(updatedTrain);
      } else {
        trainMap.set(key, [updatedTrain]);
      }

      nextTrains.push(updatedTrain);
    }

    // MERGE TRAINS entering same cell with same outgoingDirection on complex tracks
const mergedTrains = [];

for (const [pos, trainsAtPos] of trainMap.entries()) {
  const [rowStr, colStr] = pos.split(",");
  const row = parseInt(rowStr, 10);
  const col = parseInt(colStr, 10);
  const cell = updatedGrid[row][col];

  if (cell?.type === "track" && cell.trackType.includes("+")) {
    // Existing merge logic for complex tracks
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
        // Merge trains with same outgoingDirection on complex tracks
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
    cell?.type === "track" &&
    ["in", "ve", "ho", "ne", "nw", "se", "sw"].includes(cell.trackType) &&
    trainsAtPos.length > 1
  ) {
    // New logic for simple tracks with multiple trains crossing
    // Mix colors of all trains, but do NOT merge them into one train

    const mixedColor = trainsAtPos.reduce((acc, t) => mixColors(acc, t.color), trainsAtPos[0].color);

    for (const t of trainsAtPos) {
      mergedTrains.push({
        ...t,
        color: mixedColor,
      });
    }
  } else {
    // Default: no merge, just add all trains as is
    mergedTrains.push(...trainsAtPos);
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

    // Step 2: move next train in queue to active (one per start cell)
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

    // NOW update allArrived after merging and queuing logic
    allArrived = finalTrains.length > 0 && finalTrains.every(t => t.hasArrived);

    // Update fail state and success state accordingly
    if (anyFailed) {
      setIsRunning(false);
      setLevelFailed(true);
      setStatus("failed");
    } else if (allArrived) {
      setIsRunning(false);
      setStatus("success");
      setLevelFailed(false);
    }

    return finalTrains;
  });
}, 500);


    return () => clearInterval(interval);
  }, [isRunning, grid]);

  // Helper outside the component
  function arraysMatchMultiset(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    const countMap = new Map();

    for (const item of arr1) {
      countMap.set(item, (countMap.get(item) || 0) + 1);
    }
    for (const item of arr2) {
      if (!countMap.has(item)) return false;
      const count = countMap.get(item);
      if (count === 1) {
        countMap.delete(item);
      } else {
        countMap.set(item, count - 1);
      }
    }
    return countMap.size === 0;
  }

  const handleRun = () => {
    if (initialTrainsRef.current.length === 0) return;
    setTrains(initialTrainsRef.current.map((train) => ({ ...train }))); // Reset trains to initial
    setIsRunning(true);
    setStatus("running");
    setLevelFailed(false);
  };

  const handleCellClick = (row, col, event) => {
    if (isRunning) return;

    const cell = grid[row][col];
    if (cell?.type === "start" || cell?.type === "end" || cell?.type === "boulder") return;

    const newGrid = [...grid];
    const current = newGrid[row][col];

    const trackCycle = [
      "ho",
      "ve",
      "se",
      "sw",
      "nw",
      "ne",
      "in",
      "senw",
      "swne",

      "se+ne",
      "sw+se",
      "sw+nw",
      "nw+ne",
      "ho+ne",
      "ho+nw",
      "ho+se",
      "ho+sw",
      "ve+ne",
      "ve+nw",
      "ve+se",
      "ve+sw",
    ];

    if (current?.type === "track") {
      if (event.shiftKey) {
        if (current.trackType.includes("+")) {
          newGrid[row][col] = {
            ...current,
            mainIsFirst: !current.mainIsFirst,
            _toggle: current._toggle ?? true,
          };
        }
      } else {
        const currentIndex = trackCycle.indexOf(current.trackType);
        const nextType = trackCycle[(currentIndex + 1) % trackCycle.length];
        newGrid[row][col] = { ...current, trackType: nextType };
        if (nextType.includes("+")) {
          newGrid[row][col].mainIsFirst = true;
        } else {
          delete newGrid[row][col].mainIsFirst;
        }
      }
    } else {
      newGrid[row][col] = selectedTool;
    }

    setGrid(newGrid);
  };

  return (
    <div className="p-4 space-y-4">
      <Toolbox
        setSelectedTool={setSelectedTool}
        handleRun={handleRun}
        loadLevel={resetLevel}
        setIsRunning={setIsRunning}
        onLevelChange={setCurrentLevel}
      />
      <Grid grid={grid} onCellClick={handleCellClick} trains={trains} />
      <div className="text-lg font-bold">Status: {status}</div>
      {levelFailed && <div className="text-red-600 font-bold mt-2">Level Failed!</div>}
    </div>
  );
};

export default TrainyardGame;
