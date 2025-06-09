const levelFiles = import.meta.glob("/public/levels/level-*.json", {
  eager: true,
});

const levelIndex = {};

Object.keys(levelFiles)
  .map((path) => {
    const match = path.match(/level-(\d+)\.json$/);
    return match ? parseInt(match[1], 10) : null;
  })
  .filter((n) => n !== null)
  .sort((a, b) => b - a) // descending
  .forEach((i) => {
    const name = `level-${i}`;
    levelIndex[name] = `/levels/${name}.json`;
  });

export default levelIndex;
