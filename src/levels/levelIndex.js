const levelIndex = {};

for (let i = 1; i <= 10; i++) {
  const name = `level-${i}`;
  levelIndex[name] = `/levels/${name}.json`;
}

export default levelIndex;
