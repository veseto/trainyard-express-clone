import React, { useState, useEffect, useRef } from "react";
import Grid from "./components/Grid";
import Toolbox from "./components/Toolbox";
import { createEmptyGrid, moveTrain, mergeTrains } from "./utils/utils";
import { loadLevelFromJson } from "./levels/levelLoader";
import { mixColors } from "./utils/mixColors";
import levelIndex from "./levels/levelIndex";
import expectedPaths from './levels/expectedPaths.js';
const levelKeys = Object.keys(levelIndex);
const maxLevelNum = levelKeys
  .map((key) => {
    const match = key.match(/level-(\d+)/);
    return match ? parseInt(match[1], 10) : -Infinity;
  })
  .reduce((max, num) => (num > max ? num : max), -Infinity);

const lastLevelKey = `level-${maxLevelNum}`;

const GRID_SIZE = 7;

const TrainyardGame = () => {
  const [grid, setGrid] = useState(createEmptyGrid(GRID_SIZE));
  const [trains, setTrains] = useState([]);
  const initialTrainsRef = useRef([]);
  const [selectedTool, setSelectedTool] = useState({ type: "track", trackType: "straight-horizontal" });
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("idle");
  const [currentLevel, setCurrentLevel] = useState(lastLevelKey);
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
    console.log(grid);
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

const mergedTrains = mergeTrains({ trains: nextTrains, grid: updatedGrid });

// Add all queued trains back in
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
    setGrid(updatedGrid);

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
      "ne+ve",
      "nw+ve",
      "se+ve",
      "sw+ve",
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

  const handleTestAllLevels = async () => {
  setIsRunning(false);
  setStatus("testing...");
  setLevelFailed(false);

  const results = [];

  for (const levelKey of Object.keys(levelIndex)) {
    const { grid: loadedGrid, trains: loadedTrains } = await loadLevelFromJson(levelKey);

    // Patch expected tracks into the grid for testing
    addExpectedTracksToGrid(loadedGrid, levelKey);

    // Deep copy to avoid mutations affecting original level data
    let trains = loadedTrains.map(t => ({ ...t }));
    let gridCopy = loadedGrid.map(row => row.map(cell => (cell ? { ...cell } : null)));


    let step = 0;
    const maxSteps = 1000;
    let levelStatus = "running";

    while (step < maxSteps && levelStatus === "running") {
      step++;
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
          if (!trainMap.has(key)) trainMap.set(key, []);
          trainMap.get(key).push(updatedTrain);
        }

        nextTrains.push(updatedTrain);
      }

      // Merge logic (same as main loop)
      const mergedTrains = mergeTrains({ trains: nextTrains, grid: updatedGrid });


      // Add queued trains
      for (const t of nextTrains) {
        if (t.isQueued) mergedTrains.push(t);
      }

      // Validate arrivals
      for (const [key, arrivedTrains] of arrivedAtEnds.entries()) {
        const [rowStr, colStr] = key.split(",");
        const row = parseInt(rowStr, 10);
        const col = parseInt(colStr, 10);
        const endCell = updatedGrid[row][col];

        if (endCell?.type === "end") {
          const expected = Array.isArray(endCell.color) ? endCell.color : [endCell.color];
          const actual = arrivedTrains.map(t => t.color);
          if (!arraysMatchMultiset(expected, actual)) {
            arrivedTrains.forEach(t => t.hasFailed = true);
            anyFailed = true;
          }
        }
      }

      // Move queued trains
      const startsActivated = new Set();
      const finalTrains = [];

      for (const t of mergedTrains) {
        if (t.isQueued && !t.hasFailed && !t.hasArrived) {
          const key = `${t.row},${t.col}`;
          if (!startsActivated.has(key)) {
            finalTrains.push({ ...t, isQueued: false });
            startsActivated.add(key);
          } else {
            finalTrains.push(t);
          }
        } else {
          finalTrains.push(t);
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
    }

    if (levelStatus === "running") {
      levelStatus = "timeout";
    }

    results.push({ level: levelKey, status: levelStatus });
  }

  console.table(results);
  setStatus("tested");
};


function addExpectedTracksToGrid(grid, levelKey) {
  const tracks = expectedPaths[levelKey];
  if (!tracks) return; // no expected tracks for this level

  for (const { row, col, trackType } of tracks) {
    // If the cell exists, patch its trackType, else create new track cell
    if (grid[row] && grid[row][col]) {
      grid[row][col].type = "track";
      grid[row][col].trackType = trackType;
    } else if (grid[row]) {
      grid[row][col] = { type: "track", trackType };
    } else {
      // If row does not exist (shouldn't happen), optionally create
      // but generally your grid shape is fixed
    }
  }
}


  return (
    <div className="p-4 space-y-4">
      <Toolbox
        setSelectedTool={setSelectedTool}
        handleRun={handleRun}
        loadLevel={resetLevel}
        setIsRunning={setIsRunning}
        onLevelChange={setCurrentLevel}
        handleTestAllLevels={handleTestAllLevels} // NEW
      />
      <Grid grid={grid} onCellClick={handleCellClick} trains={trains} />
      <div className="text-lg font-bold">Status: {status}</div>
      {levelFailed && <div className="text-red-600 font-bold mt-2">Level Failed!</div>}
    </div>
  );
};

export default TrainyardGame;