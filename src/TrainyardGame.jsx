import React, { useState, useEffect, useRef } from "react";
import Grid from "./components/Grid";
import Toolbox from "./components/Toolbox";
import { createEmptyGrid, moveTrain, mergeTrains } from "./utils/utils";
import { loadLevelFromJson } from "./levels/levelLoader";
import expectedPaths from "./levels/expectedPaths.js";
import levelIndex from "./levels/levelIndex";

const GRID_SIZE = 7;
const levelKeys = Object.keys(levelIndex);

// Get the highest numbered level key from levelIndex (e.g., "level-3")
const maxLevelNum = levelKeys.reduce((max, key) => {
  const match = key.match(/level-(\d+)/);
  return match ? Math.max(max, parseInt(match[1], 10)) : max;
}, -Infinity);
const lastLevelKey = `level-${maxLevelNum}`;

// Utility: Check if two arrays match as multisets (order-independent with counts)
const arraysMatchMultiset = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  const countMap = new Map();
  for (const val of arr1) countMap.set(val, (countMap.get(val) || 0) + 1);
  for (const val of arr2) {
    if (!countMap.has(val)) return false;
    const count = countMap.get(val);
    if (count === 1) countMap.delete(val);
    else countMap.set(val, count - 1);
  }
  return countMap.size === 0;
};

const TrainyardGame = () => {
  const [grid, setGrid] = useState(createEmptyGrid(GRID_SIZE));
  const [trains, setTrains] = useState([]);
  const initialTrainsRef = useRef([]);
  const [selectedTool, setSelectedTool] = useState({
    type: "track",
    trackType: "straight-horizontal",
  });
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("idle");
  const [currentLevel, setCurrentLevel] = useState(lastLevelKey);
  const [levelFailed, setLevelFailed] = useState(false);
  const [arrivedTrainsByEndCell, setArrivedTrainsByEndCell] = useState(new Map());
  const [requiredColorsMap, setRequiredColorsMap] = useState(new Map());

  // Load and reset level
  const resetLevel = async (level = currentLevel) => {
    const { grid: loadedGrid, trains: loadedTrains } = await loadLevelFromJson(level);
    setGrid(loadedGrid);
    setTrains(loadedTrains);
    setArrivedTrainsByEndCell(new Map());
    initialTrainsRef.current = loadedTrains.map(t => ({ ...t }));
    setStatus("idle");
    setIsRunning(false);
    setLevelFailed(false);
    const map = new Map();
    for (let r = 0; r < loadedGrid.length; r++) {
      for (let c = 0; c < loadedGrid[r].length; c++) {
        const cell = loadedGrid[r][c];
        if (cell?.type === "end") {
          map.set(`${r},${c}`, Array.isArray(cell.color) ? [...cell.color] : [cell.color]);
        }
      }
    }
  };

  // Load level on mount or when currentLevel changes
  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  // Main game loop when running
  useEffect(() => {
  if (!isRunning) return;
  console.log(grid);
  const interval = setInterval(() => {
    setTrains((prevTrains) => {
      const updatedGrid = grid.map((row) => row.map((cell) => (cell ? { ...cell } : null)));

      let anyFailed = false;

      // We will build next trains array by filtering out trains that arrived successfully at ends
      const nextTrains = [];

      prevTrains.forEach((train) => {
        if (train.hasArrived || train.hasFailed || train.isQueued) {
          if (train.hasFailed) anyFailed = true;
          nextTrains.push(train);
          return;
        }

        const { updatedTrain, toggleCell, outgoingDirection } = moveTrain({
          train,
          grid: updatedGrid,
        });

        if (toggleCell) {
          const { row, col, newToggle } = toggleCell;
          if (updatedGrid[row][col]) {
            updatedGrid[row][col]._toggle = newToggle;
          }
        }

        updatedTrain.outgoingDirection = outgoingDirection;

        if (updatedTrain.hasArrived) {
          const key = `${updatedTrain.row},${updatedTrain.col}`;
          const requiredColors = requiredColorsMap.get(key);

          if (!requiredColors) {
            // No expected colors for this end cell? Possibly error or just allow.
            nextTrains.push(updatedTrain);
          } else {
            const idx = requiredColors.indexOf(updatedTrain.color);

            if (idx === -1) {
              // Train color not expected here => fail level immediately
              updatedTrain.hasFailed = true;
              anyFailed = true;
              nextTrains.push(updatedTrain);
            } else {
              // Remove the arrived train color from requiredColors array
              requiredColors.splice(idx, 1);
              // Train successfully arrived and fulfilled a color requirement, so do NOT add back to active trains
            }
          }
        } else {
          nextTrains.push(updatedTrain);
        }

        if (updatedTrain.hasFailed) anyFailed = true;
      });

      // Activate queued trains (one per start cell per tick)
      const startsActivated = new Set();
      const finalTrains = nextTrains.map((train) => {
        if (train.isQueued && !train.hasArrived && !train.hasFailed) {
          const key = `${train.row},${train.col}`;
          if (!startsActivated.has(key)) {
            startsActivated.add(key);
            return { ...train, isQueued: false };
          }
        }
        return train;
      });

      // Check if all trains done (arrived or failed)
      const allDone = finalTrains.every((t) => t.hasArrived || t.hasFailed);

      if (allDone) {
        // Check if all end cells have empty requiredColors arrays
        let success = true;
        for (const colorsArr of requiredColorsMap.values()) {
          if (colorsArr.length > 0) {
            success = false;
            break;
          }
        }

        setIsRunning(false);
        setStatus(success && !anyFailed ? "success" : "failed");
        setLevelFailed(!success || anyFailed);
      }

      setGrid(updatedGrid);
      return finalTrains;
    });
  }, 500);

  return () => clearInterval(interval);
}, [isRunning, grid, requiredColorsMap]);


  // Start running trains
  const handleRun = () => {
    if (!initialTrainsRef.current.length) return;
    setTrains(initialTrainsRef.current.map((t) => ({ ...t })));
    setIsRunning(true);
    setStatus("running");
    setLevelFailed(false);
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

    results.push({ level: levelKey, status: levelStatus, steps: step });
  }

  console.table(results);
  setStatus("tested");
};



  // Handle level select change
  const handleLevelChange = (level) => {
    setCurrentLevel(level);
  };

  // Handle clicking on a grid cell (for placing or toggling tracks)
  const handleCellClick = (row, col, event) => {
    if (isRunning) return;

    const cell = grid[row]?.[col];

    // Prevent editing start, end, or boulders
    if (["start", "end", "boulder"].includes(cell?.type)) return;

    const newGrid = grid.map((r) => r.map((c) => (c ? { ...c } : null)));

    // Track types cycle order, including dual-path track combos
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

    if (cell?.type === "track") {
      if (event.shiftKey && cell.trackType.includes("+")) {
        // Toggle mainIsFirst flag on dual-path tracks when shift-clicking
        newGrid[row][col] = {
          ...cell,
          mainIsFirst: !cell.mainIsFirst,
          _toggle: cell._toggle ?? true,
        };
      } else {
        // Cycle through track types on click
        const currentIndex = trackCycle.indexOf(cell.trackType);
        const nextType = trackCycle[(currentIndex + 1) % trackCycle.length];
        newGrid[row][col] = { ...cell, trackType: nextType };
        if (nextType.includes("+")) {
          newGrid[row][col].mainIsFirst = true;
        } else {
          delete newGrid[row][col].mainIsFirst;
          delete newGrid[row][col]._toggle;
        }
      }
    } else {
      // Place selected tool on empty or non-track cell
      newGrid[row][col] = { ...selectedTool };
    }

    setGrid(newGrid);
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

  // Select tool change handler
  const handleToolChange = (tool) => {
    setSelectedTool(tool);
  };

   return (
    <div className="p-4 space-y-4">
      <Toolbox
        setSelectedTool={setSelectedTool}
        handleRun={handleRun}
        loadLevel={resetLevel}
        setIsRunning={setIsRunning}
        onLevelChange={setCurrentLevel}
        handleTestAllLevels={handleTestAllLevels}
      />
      <Grid
        grid={grid}
        onCellClick={handleCellClick}
        trains={trains}
      />
      <div className="text-lg font-bold">
        Status: {status}
      </div>
    </div>
  );
};

export default TrainyardGame;