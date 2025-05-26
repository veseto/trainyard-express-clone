import { useState, useEffect } from "react";
import Grid from "./components/Grid";
import Toolbox from "./components/Toolbox";
import { createEmptyGrid, moveTrain } from "./utils/utils";
import { loadLevelFromJson } from "./levels/levelLoader";

const GRID_SIZE = 7;

const TrainyardGame = () => {
  const [grid, setGrid] = useState(createEmptyGrid(GRID_SIZE));
  const [trains, setTrains] = useState([]);
  const [selectedTool, setSelectedTool] = useState({ type: "track", trackType: "straight-horizontal" });
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("idle");
  const [currentLevel, setCurrentLevel] = useState("level-1");

  const resetLevel = async (level = currentLevel) => {
    const loaded = await loadLevelFromJson(level);
    setGrid(loaded.grid);
    setTrains([]);
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

        const trainMap = new Map();
        const nextTrains = [];

        // Move all trains and handle intersections
        for (const train of prevTrains) {
          if (train.hasArrived || train.hasFailed) {
            nextTrains.push(train);
            if (train.hasFailed) anyFailed = true;
            continue;
          }

          let nextTrain = null;
          moveTrain({
            train,
            grid,
            setTrain: t => {
              nextTrain = t;
            }
          });

          if (nextTrain?.hasFailed) anyFailed = true;
          if (!nextTrain?.hasArrived && !nextTrain?.hasFailed) allArrived = false;

          const key = `${nextTrain?.row},${nextTrain?.col}`;
          if (trainMap.has(key)) {
            const existing = trainMap.get(key);
            trainMap.set(key, [...existing, nextTrain]);
          } else {
            trainMap.set(key, [nextTrain]);
          }

          nextTrains.push(nextTrain);
        }

        // Handle intersections where multiple trains meet
        for (const [key, trainsAtCell] of trainMap.entries()) {
          if (trainsAtCell.length > 1) {
            const cell = grid[trainsAtCell[0].row][trainsAtCell[0].col];
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
              // Apply the new color to all trains at this intersection
              trainMap.set(key, trainsAtCell.map(t => ({ ...t, color: newColor })));
            }
          }
        }

        // Flatten updated train list
        const flattened = [];
        for (const trains of trainMap.values()) {
          flattened.push(...trains);
        }

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
    const startCells = findStartCells();
    if (startCells.length === 0) return;
    setTrains(startCells.map(cell => ({
      row: cell.row,
      col: cell.col,
      direction: cell.direction,
      color: cell.color,
      hasArrived: false,
      hasFailed: false
    })));
    setIsRunning(true);
  };

  const findStartCells = () => {
    const starts = [];
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cell = grid[row][col];
        if (cell?.type === "start") {
          starts.push({ row, col, ...cell });
        }
      }
    }
    return starts;
  };

  const handleCellClick = (row, col) => {
    if (isRunning) return;

    const cell = grid[row][col];
    if (cell?.type === "start" || cell?.type === "end" || cell?.type === "boulder") return;

    const newGrid = [...grid];
    const current = newGrid[row][col];

    if (current?.type === "track") {
      const rotationMap = {
        "straight-horizontal": "straight-vertical",
        "straight-vertical": "curve-se",
        "curve-se": "curve-sw",
        "curve-sw": "curve-nw",
        "curve-nw": "curve-ne",
        "curve-ne": "intersection",
        "intersection": "senw",
        "senw" : "swne", 
        "swne" : "straight-horizontal"
      };
      const nextType = rotationMap[current.trackType] || "straight-horizontal";
      newGrid[row][col] = { ...current, trackType: nextType };
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
