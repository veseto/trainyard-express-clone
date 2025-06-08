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
  const trainHere = trains.find(t => t.row === row && t.col === col);
  if (trainHere) {
    return <span className={colorClasses[trainHere.color] || ""}>&</span>;
  }

  if (!cell) return null;

  if (cell.type === "boulder") {
    return <span className="text-gray-700 font-bold">🪨</span>;
  }

  if (cell.type === "start") {
    const directions = Array.isArray(cell.direction) ? cell.direction : [cell.direction];
    const colors = Array.isArray(cell.color) ? cell.color : [cell.color];

    return (
      <span>
        {directions.map((dir, i) => (
          <span key={dir + i}>{directionSymbols[dir]}</span>
        ))}
        {colors.map((clr, i) => (
          <span key={clr + i} className={colorClasses[clr] || ""}>&</span>
        ))}
      </span>
    );
  }

  if (cell.type === "end") {
    const directions = Array.isArray(cell.direction) ? cell.direction : [cell.direction];
    const colors = Array.isArray(cell.color) ? cell.color : [cell.color];

    return (
      <span>
        {directions.map((dir, i) => (
          <span key={dir + i}>{directionSymbols[dir]}</span>
        ))}
        {colors.map((clr, i) => (
          <span key={clr + i} className={colorClasses[clr] || ""}>*</span>
        ))}
      </span>
    );
  }

  if (cell.type === "track") {
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
    return symbolMap[cell.trackType] || "";
  }

  return null;
};

export default getCellSymbol;
