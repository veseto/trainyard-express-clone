import { useState, useEffect, useRef } from "react";
import Grid from "./components/Grid";
import Toolbox from "./components/Toolbox";
import { createEmptyGrid, moveTrain } from "./utils/utils";
import { loadLevelFromJson } from "./levels/levelLoader";

const GRID_SIZE = 7;

const TrainyardGame = () => {
  const [grid, setGrid] = useState(createEmptyGrid(GRID_SIZE));
  const [trains, setTrains] = useState([]);
  const initialTrainsRef = useRef([]);
  const [selectedTool, setSelectedTool] = useState({ type: "track", trackType: "straight-horizontal" });
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("idle");
  const [currentLevel, setCurrentLevel] = useState("level-12");

  const resetLevel = async (level = currentLevel) => {
    const { grid: loadedGrid, trains: loadedTrains } = await loadLevelFromJson(level);
    setGrid(loadedGrid);
    setTrains(loadedTrains);
    initialTrainsRef.current = loadedTrains; // Save initial trains for reset
    setStatus("idle");
    setIsRunning(false);
  };

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  useEffect(() => {
  if (!isRunning) return;

  const interval = setInterval(() => {
    setTrains(prevTrains => {
      let anyFailed = false;
      let allArrived = true;

      let updatedGrid = grid.map(row => row.map(cell => ({ ...cell }))); // deep clone grid

      const trainMap = new Map();

      const nextTrains = [];

      for (const train of prevTrains) {
        if (train.hasArrived || train.hasFailed || train.isQueued) {
          nextTrains.push(train);
          if (train.hasFailed) anyFailed = true;
          continue;
        }

        const { updatedTrain, toggleCell } = moveTrain({ train, grid: updatedGrid });

        if (toggleCell) {
          const { row, col, newToggle } = toggleCell;
          updatedGrid[row][col]._toggle = newToggle;
        }

        if (updatedTrain.hasFailed) anyFailed = true;
        if (!updatedTrain.hasArrived && !updatedTrain.hasFailed) allArrived = false;

        const key = `${updatedTrain.row},${updatedTrain.col}`;
        if (trainMap.has(key)) {
          const existing = trainMap.get(key);
          trainMap.set(key, [...existing, updatedTrain]);
        } else {
          trainMap.set(key, [updatedTrain]);
        }

        nextTrains.push(updatedTrain);
      }

      // Step 2: move next train in queue to active (one per start cell)
      const startsActivated = new Set();
      const finalTrains = [];

      for (const train of nextTrains) {
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

      // Handle color mixing at intersections
      for (const [key, trainsAtCell] of trainMap.entries()) {
        if (trainsAtCell.length > 1) {
          const [r, c] = key.split(",").map(Number);
          const cell = updatedGrid[r][c];
          if (cell?.type === "track" && cell.trackType === "intersection") {
            const colorSet = new Set(trainsAtCell.map(t => t.color));
            let newColor = "brown";
            if (colorSet.size === 1) {
              newColor = trainsAtCell[0].color;
            } else if (colorSet.has("red") && colorSet.has("blue") && colorSet.size === 2) {
              newColor = "purple";
            } else if (colorSet.has("red") && colorSet.has("yellow") && colorSet.size === 2) {
              newColor = "orange";
            } else if (colorSet.has("yellow") && colorSet.has("blue") && colorSet.size === 2) {
              newColor = "green";
            }
            trainMap.set(key, trainsAtCell.map(t => ({ ...t, color: newColor })));
          }
        }
      }

      // Flatten updated trains
      const flattened = [];
      for (const trainsAtCell of trainMap.values()) {
        flattened.push(...trainsAtCell);
      }
      flattened.push(...finalTrains.filter(t => !new Set(flattened.map(ft => ft.id)).has(t.id)));

      setGrid(updatedGrid);

      if (anyFailed) {
        setIsRunning(false);
        setStatus("fail");
      } else if (allArrived) {
        setIsRunning(false);
        setStatus("success");
      }

      return flattened;
    });
  }, 500);

  return () => clearInterval(interval);
}, [isRunning, grid]);


  const handleRun = () => {
    if (initialTrainsRef.current.length === 0) return;
    setTrains(initialTrainsRef.current.map(train => ({ ...train }))); // Reset trains to initial
    setIsRunning(true);
    setStatus("running");
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
      "ve+sw"
    ];

    if (current?.type === "track") {
      if (event.shiftKey) {
        // Toggle mainIsFirst for dual-path tracks only
        if (current.trackType.includes("+")) {
          newGrid[row][col] = {
            ...current,
            mainIsFirst: !current.mainIsFirst,
            _toggle: current._toggle ?? true, // ✅ preserve existing toggle or initialize
          };
        }

      } else {
        // Cycle to next trackType normally
        const currentIndex = trackCycle.indexOf(current.trackType);
        const nextType = trackCycle[(currentIndex + 1) % trackCycle.length];
        newGrid[row][col] = { ...current, trackType: nextType };
        // Reset mainIsFirst to true when switching track type
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
