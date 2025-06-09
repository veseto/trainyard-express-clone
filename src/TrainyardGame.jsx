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
  const [currentLevel, setCurrentLevel] = useState("level-1");

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

        const activeTrains = [];
        const nextTrains = [];
        const trainMap = new Map();

        // Step 1: move active trains
        for (const train of prevTrains) {
          if (train.hasArrived || train.hasFailed || train.isQueued) {
            nextTrains.push(train);
            if (train.hasFailed) anyFailed = true;
            continue;
          }

          let nextTrain = null;

          moveTrain({
            train,
            grid,
            setGrid,
            setTrain: (updatedTrain) => {
              nextTrain = updatedTrain;
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

          activeTrains.push(nextTrain);
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

        finalTrains.push(...activeTrains);

        // Handle color mixing at intersections
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
            mainIsFirst: !current.mainIsFirst
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
