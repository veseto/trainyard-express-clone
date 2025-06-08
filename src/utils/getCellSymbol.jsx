import React from "react";

const directionSymbols = {
  up: "^",
  down: "v",
  left: "<",
  right: ">"
};

const colorClasses = {
  red: "text-red-500",
  blue: "text-blue-500",
  green: "text-green-500",
  yellow: "text-yellow-500",
  purple: "text-purple-500",
  orange: "text-orange-500",
  brown: "text-amber-900"
};

const getCellSymbol = (cell, trains, row, col) => {
  if (!cell) return null;

  // Find all trains in this cell
  const trainsHere = trains.filter(t => t.row === row && t.col === col);

  // Prepare the cell content without trains
  let cellContent = null;

  if (cell.type === "boulder") {
    cellContent = <span className="text-gray-700 font-bold">🪨</span>;
  } else if (cell.type === "start") {
    cellContent = <span className={colorClasses[cell.color]}>{directionSymbols[cell.direction]}</span>
  } else if (cell.type === "end") {
    const directions = Array.isArray(cell.direction) ? cell.direction : [cell.direction];
    const colors = Array.isArray(cell.color) ? cell.color : [cell.color];

    cellContent = (
      <span>
        {directions.map((dir, i) => (
          <span key={dir + i}>{directionSymbols[dir]}</span>
        ))}
        {colors.map((clr, i) => (
          <span key={clr + i} className={colorClasses[clr] || ""}>*</span>
        ))}
      </span>
    );
  } else if (cell.type === "track") {
    const symbolMap = {
      "straight-horizontal": "═",
      "straight-vertical": "║",
      "curve-ne": "╚",
      "curve-nw": "╝",
      "curve-sw": "╗",
      "curve-se": "╔",
      "intersection": "╬",
      "senw": "╝╔",
      "swne": "╗╚"
    };
    cellContent = symbolMap[cell.trackType] || "";
  }

  // Now render cell content + trains stacked below
  return (
    <span className="flex flex-col items-center space-y-0.5 select-none">
      <span>{cellContent}</span>
      {trainsHere.length > 0 && (
        <span className="flex flex-col items-center space-y-0.5 -mt-1">
          {trainsHere.map((train, i) => (
            <span key={i} className={colorClasses[train.color] || ""}>&</span>
          ))}
        </span>
      )}
    </span>
  );
};

export default getCellSymbol;
