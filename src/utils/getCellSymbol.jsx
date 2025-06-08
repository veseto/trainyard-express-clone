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
  brown: "text-amber-900",
  grey: "text-gray-400"
};

const simpleSymbolMap = {
  ho: "═",
  ve: "║",
  se: "╔",
  sw: "╗",
  nw: "╝",
  ne: "╚",
  in: "╬",
  senw: "╝╔",
  swne: "╗╚"
};

const getCellSymbol = (cell, trains, row, col) => {
  if (!cell) return null;

  const trainsHere = trains.filter(t => t.row === row && t.col === col);

  let cellContent = null;

  if (cell.type === "boulder") {
    cellContent = <span className="text-gray-700 font-bold">🪨</span>;
  } else if (cell.type === "start") {
    cellContent = <span className={colorClasses[cell.color]}>{directionSymbols[cell.direction]}</span>;
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
    if (cell.trackType.includes("+")) {
  const [first, second] = cell.trackType.split("+");
  const mainIsFirst = cell.mainIsFirst !== false; // default true
  const toggle = cell._toggle !== false; // default true

  // Determine which track is main based on toggle and mainIsFirst
  // But do NOT swap symbol order, just style
  const firstIsMain = toggle ? mainIsFirst : !mainIsFirst;
  const secondIsMain = !firstIsMain;

  cellContent = (
    <span className="flex space-x-0.5 select-none">
      <span className={firstIsMain ? "" : colorClasses.grey}>{simpleSymbolMap[first]}</span>
      <span className={secondIsMain ? "" : colorClasses.grey}>{simpleSymbolMap[second]}</span>
    </span>
  );
} else {
  // Single path
  cellContent = simpleSymbolMap[cell.trackType] || "";
}

  }

  return (
  <span className="flex flex-col items-center justify-center leading-tight select-none">
    <span className="leading-tight">{cellContent}</span>
    {trainsHere.length > 0 && (
      <span className="flex flex-wrap justify-center -mt-0.5">
        {trainsHere.map((train, i) => (
          <span key={i} className={colorClasses[train.color] || ""}>&</span>
        ))}
      </span>
    )}
  </span>
);

};

export default getCellSymbol;
