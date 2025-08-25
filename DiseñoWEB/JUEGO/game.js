const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 480;

// ========== MAPAS ==========
const maps = [
  {
    name: "Mapa 1",
    layout: [
      [1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,1],
      [1,0,0,1,0,0,0,1],
      [1,0,0,1,0,0,0,1],
      [1,0,0,0,0,1,0,1],
      [1,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1],
    ]
  },
  {
    name: "Mapa 2",
    layout: [
      [1,1,1,1,1,1,1,1],
      [1,0,1,0,0,0,0,1],
      [1,0,1,0,1,1,0,1],
      [1,0,0,0,0,1,0,1],
      [1,0,1,1,0,0,0,1],
      [1,0,0,0,0,1,0,1],
      [1,1,1,1,1,1,1,1],
    ]
  }
];

let currentMapIndex = 0;
let map = maps[currentMapIndex].layout;

const tileSize = 64;
const fov = Math.PI / 3;
const numRays = canvas.width;
const maxDepth = 800;

let player = {
  x: 100,
  y: 100,
  angle: 0,
  speed: 2
};

// ========== ENEMIGOS ==========
let enemies = [
  { x: 200, y: 200, alive: true }
];

// ========== DISPAROS ==========
function shoot() {
  for (let enemy of enemies) {
    if (!enemy.alive) continue;
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const angleToEnemy = Math.atan2(dy, dx);
    let angleDiff = Math.abs(player.angle - angleToEnemy);
    if (angleDiff < 0.2) {
      enemy.alive = false;
      console.log("¡Enemigo eliminado!");
    }
  }
}

// ========== INPUT ==========
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " ") shoot();
});
window.addEventListener("keyup", (e) => keys[e.key] = false);

// ========== RAYCAST ==========
function castRays() {
  let startAngle = player.angle - fov / 2;

  for (let i = 0; i < numRays; i++) {
    let rayAngle = startAngle + (fov * i) / numRays;
    let distanceToWall = 0;
    let hitWall = false;

    let eyeX = Math.cos(rayAngle);
    let eyeY = Math.sin(rayAngle);

    while (!hitWall && distanceToWall < maxDepth) {
      distanceToWall += 1;
      let testX = Math.floor((player.x + eyeX * distanceToWall) / tileSize);
      let testY = Math.floor((player.y + eyeY * distanceToWall) / tileSize);

      if (
        testX < 0 || testX >= map[0].length ||
        testY < 0 || testY >= map.length
      ) {
        hitWall = true;
        distanceToWall = maxDepth;
      } else if (map[testY][testX] > 0) {
        hitWall = true;
      }
    }

    const wallHeight = Math.min(canvas.height, canvas.height / (distanceToWall * 0.02));
    const color = `rgb(${255 - distanceToWall}, ${255 - distanceToWall}, ${255 - distanceToWall})`;
    ctx.fillStyle = color;
    ctx.fillRect(i, (canvas.height - wallHeight) / 2, 1, wallHeight);
  }
}

// ========== ACTUALIZACIÓN ==========
function update() {
  if (keys["ArrowUp"]) {
    player.x += Math.cos(player.angle) * player.speed;
    player.y += Math.sin(player.angle) * player.speed;
  }
  if (keys["ArrowDown"]) {
    player.x -= Math.cos(player.angle) * player.speed;
    player.y -= Math.sin(player.angle) * player.speed;
  }
  if (keys["ArrowLeft"]) {
    player.angle -= 0.05;
  }
  if (keys["ArrowRight"]) {
    player.angle += 0.05;
  }
}

// ========== ENEMIGOS ==========
function renderEnemies() {
  for (let enemy of enemies) {
    if (!enemy.alive) continue;

    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angleToEnemy = Math.atan2(dy, dx);
    let angleDiff = angleToEnemy - player.angle;

    if (Math.abs(angleDiff) < fov / 2) {
      const screenX = (angleDiff + fov / 2) / fov * canvas.width;
      const size = 500 / dist;
      ctx.fillStyle = "red";
      ctx.fillRect(screenX - size / 2, canvas.height / 2 - size / 2, size, size);
    }
  }
}

// ========== CAMBIO DE MAPA ==========
function changeMap() {
  currentMapIndex = (currentMapIndex + 1) % maps.length;
  map = maps[currentMapIndex].layout;
  player.x = 100;
  player.y = 100;
  player.angle = 0;
  enemies = [{ x: 200, y: 200, alive: true }];
}
window.addEventListener("keydown", (e) => {
  if (e.key === "m") changeMap();
});

// ========== BUCLE ==========
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  castRays();
  renderEnemies();
  requestAnimationFrame(gameLoop);
}
gameLoop();
