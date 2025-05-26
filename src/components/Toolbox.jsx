// src/components/Toolbox.jsx
import React from "react";

const Toolbox = ({ handleRun, loadLevel, setIsRunning, onLevelChange }) => {
  const levels = ["level-1", "level-2", "level-3", "level-4", "level-5", "level-6", "level-7", "level-8", "level-9"];

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
        {levels.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Toolbox;
