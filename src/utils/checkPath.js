// src/utils/checkPath.js
export function checkTrainPath(trains, expectedPath) {
  // trains: array of train objects with .row and .col
  // expectedPath: array of {row, col} objects

  // For simplicity, check that for each position in expectedPath,
  // there is at least one train that visited that position at some point.

  // If you want step-by-step checking, you can modify this later.

  for (const pos of expectedPath) {
    const found = trains.some(train => train.row === pos.row && train.col === pos.col);
    if (!found) return false; // missing this position
  }

  return true; // all positions covered
}
