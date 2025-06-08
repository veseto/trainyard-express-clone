import React from "react";
import getCellSymbol from "../utils/getCellSymbol";

const Grid = ({ grid, trains, onCellClick }) => {
  return (
    <div className="inline-grid grid-cols-7 gap-[2px]">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="w-14 h-14 flex items-center justify-center border border-gray-300 text-base cursor-pointer"
            onClick={(e) => onCellClick(rowIndex, colIndex, e)} // pass event here
          >
            {getCellSymbol(cell, trains, rowIndex, colIndex)}
          </div>
        ))
      )}
    </div>
  );
};

export default Grid;
