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


export default Toolbox;
