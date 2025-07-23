const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelDisplay = document.getElementById('levelDisplay');

let currentLevel = 1;
let maze = [];
let tileSize = 20;
let player = { x: 1, y: 1 };
let goal = { x: 1, y: 1 };

// Maze-Erstellung mit DFS
function generateMaze(cols, rows) {
  // Gitter vorbereiten
  let grid = Array.from({ length: rows }, () => Array(cols).fill(1));

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function carve(x, y) {
    grid[y][x] = 0;
    const dirs = shuffle([
      [0, -2],
      [2, 0],
      [0, 2],
      [-2, 0]
    ]);

    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        nx > 0 && ny > 0 &&
        nx < cols - 1 && ny < rows - 1 &&
        grid[ny][nx] === 1
      ) {
        grid[y + dy / 2][x + dx / 2] = 0; // Wand dazwischen öffnen
        carve(nx, ny);
      }
    }
  }

  carve(1, 1); // Startpunkt

  return grid;
}

function loadLevel(level) {
  const cols = 11 + level * 2;
  const rows = 11 + level * 2;

  // Canvas-Größe anpassen
  canvas.width = Math.min(800, cols * tileSize);
  canvas.height = Math.min(800, rows * tileSize);

  maze = generateMaze(cols, rows);
  player = { x: 1, y: 1 };
  goal = { x: cols - 2, y: rows - 2 };
  maze[goal.y][goal.x] = 0;

  levelDisplay.textContent = level;
  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      ctx.fillStyle = maze[y][x] === 1 ? 'black' : 'white';
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  // Ziel (grün)
  ctx.fillStyle = 'green';
  ctx.fillRect(goal.x * tileSize, goal.y * tileSize, tileSize, tileSize);

  // Spieler (rot)
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(
    player.x * tileSize + tileSize / 2,
    player.y * tileSize + tileSize / 2,
    tileSize / 3,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

document.addEventListener('keydown', e => {
  let { x, y } = player;
  if (e.key === 'ArrowUp' && maze[y - 1]?.[x] === 0) y--;
  if (e.key === 'ArrowDown' && maze[y + 1]?.[x] === 0) y++;
  if (e.key === 'ArrowLeft' && maze[y]?.[x - 1] === 0) x--;
  if (e.key === 'ArrowRight' && maze[y]?.[x + 1] === 0) x++;

  player = { x, y };
  draw();

  // Ziel erreicht
  if (player.x === goal.x && player.y === goal.y) {
    setTimeout(() => {
      alert(`🎉 Level ${currentLevel} geschafft!`);
      currentLevel++;
      loadLevel(currentLevel);
    }, 100);
  }
});

loadLevel(currentLevel);
