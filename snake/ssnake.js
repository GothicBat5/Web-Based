
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID = 20;         // px per cell
const TILES = 28;         // cells per side → 28×20 = 560px

canvas.width = TILES * GRID;
canvas.height = TILES * GRID;

const snakePicker = document.getElementById('snakeColor');
const foodPicker = document.getElementById('foodColor');
const snakeHexEl = document.getElementById('snakeHex');
const foodHexEl = document.getElementById('foodHex');

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');

const lengthEl = document.getElementById('length');
const levelEl = document.getElementById('levelDisplay');

const xpBarEl = document.getElementById('xpBar');
const xpLabelEl = document.getElementById('xpLabel');
const statusDot = document.getElementById('statusDot');

const statusText = document.getElementById('statusText');
const logEl = document.getElementById('log');
const fpsEl = document.getElementById('fpsDisplay');

const startOverlay = document.getElementById('startOverlay');
const gameoverOverlay = document.getElementById('gameoverOverlay');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const finalScore = document.getElementById('finalScore');
const finalBest = document.getElementById('finalBest');

let snake = [];
let velocity = { x: 0, y: 0 };
let nextVel = { x: 0, y: 0 };   // buffered input, processed once per tick
let food = { x: 0, y: 0 };
let score = 0;
let best = 0;
let level = 1;
let foodEaten = 0;            // food eaten this level
const FOOD_PER_LEVEL = 5;

let gameState = 'start';      // 'start' | 'playing' | 'dead'
let loopId = null;
let gameSpeed = 120;          // ms per tick (default: SLOW)
let lastFps = 0;
let frameCount = 0;
let lastFpsTime = performance.now();

let snakeColor = '#00ff88';
let foodColor = '#ff3366';

function padScore(n, len = 3) 
{
  return String(n).padStart(len, '0');
}

function safeRandomFood() 
{
  let pos;
  let attempts = 0;


  do {
    pos = {
      x: Math.floor(Math.random() * TILES),
      y: Math.floor(Math.random() * TILES)
    };
    attempts++;
  } 

  while (attempts < 200 && snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  return pos;
}

function addLog(msg, isNew = false) 
{
  const el = document.createElement('div');
  el.className = 'log-entry' + (isNew ? ' new' : '');

  el.textContent = '> ' + msg;

  logEl.prepend(el);


  while (logEl.children.length > 8) 
  {
    logEl.removeChild(logEl.lastChild);
  }

  if (isNew) setTimeout(() => el.classList.remove('new'), 800);
}


function initGame() 
{
  snake = [
    { x: 14, y: 14 },
    { x: 13, y: 14 },
    { x: 12, y: 14 }
  ];

  velocity = { x: 1, y: 0 };  
  nextVel = { x: 1, y: 0 };
  score = 0;
  level = 1;
  foodEaten = 0;
  food = safeRandomFood();
  updateHUD();
}


function startGame() 
{

  if (loopId) clearInterval(loopId);
  initGame();

  gameState = 'playing';
  setStatus('active');

  startOverlay.classList.add('hidden');
  gameoverOverlay.classList.add('hidden');

  addLog('game started', true);
  loopId = setInterval(tick, gameSpeed);
}

function tick() 
{

  velocity = { ...nextVel };
  update();
  draw();
  frameCount++;

  const now = performance.now();

  if (now - lastFpsTime >= 1000) 
  {
    fpsEl.textContent = frameCount + ' FPS';
    frameCount = 0;
    lastFpsTime = now;
  }
}

function update() 
{

  const head = {
    x: snake[0].x + velocity.x,
    y: snake[0].y + velocity.y
  };

  if (head.x < 0 || head.x >= TILES || head.y < 0 || head.y >= TILES) 
  {
    die('hit wall');
    return;
  }

  for (let seg of snake) 
  {
    if (seg.x === head.x && seg.y === head.y) 
    {
      die('self collision');
      return;
    }
  }


  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) 
  {
    score += level * 10;
    foodEaten++;
    addLog(`+${level * 10} pts`, true);
    food = safeRandomFood();
    checkLevelUp();
    updateHUD();
  } 
  else {
    snake.pop();
  }
}

function checkLevelUp() 
{

  if (foodEaten >= FOOD_PER_LEVEL) 
  {
    foodEaten = 0;
    level++;
    addLog(`LEVEL UP → ${level}`, true);

    if (gameSpeed > 40) 
    {
      gameSpeed = Math.max(40, gameSpeed - 10);
      clearInterval(loopId);
      loopId = setInterval(tick, gameSpeed);
    }
  }
}

function die(reason) 
{
  gameState = 'dead';
  clearInterval(loopId);

  loopId = null;

  if (score > best) best = score;

  setStatus('dead');
  addLog(`died: ${reason}`, false);

  finalScore.textContent = score;
  finalBest.textContent = best;
  bestEl.textContent = padScore(best);


  ctx.fillStyle = 'rgba(255,51,102,0.15)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  setTimeout(() => {
    gameoverOverlay.classList.remove('hidden');
  }, 300);
}

function draw() 
{
  const W = canvas.width, H = canvas.height;

  ctx.fillStyle = '#060a0d';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(0,255,136,0.04)';
  ctx.lineWidth = 0.5;

  for (let i = 0; i <= TILES; i++) 
  {
    ctx.beginPath();
    ctx.moveTo(i * GRID, 0);
    ctx.lineTo(i * GRID, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * GRID);
    ctx.lineTo(W, i * GRID);
    ctx.stroke();
  }

  if (gameState === 'playing' || gameState === 'dead') 
  {
    const fx = food.x * GRID + GRID / 2;
    const fy = food.y * GRID + GRID / 2;
    const fs = GRID / 2 - 1;
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(Math.PI / 4);
    ctx.shadowColor = foodColor;
    ctx.shadowBlur  = 12;
    ctx.fillStyle   = foodColor;
    ctx.fillRect(-fs * 0.65, -fs * 0.65, fs * 1.3, fs * 1.3);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(-fs * 0.25, -fs * 0.25, fs * 0.5, fs * 0.5);
    ctx.restore();
  }

  for (let i = 0; i < snake.length; i++) 
  {
    const seg = snake[i];
    const isHead = i === 0;
    const x = seg.x * GRID;
    const y = seg.y * GRID;
    const pad = isHead ? 1 : 2;
    const sz  = GRID - pad * 2;

    ctx.save();
    if (isHead) 
    {
      ctx.shadowColor = snakeColor;
      ctx.shadowBlur  = 10;
    }

    const alpha = isHead ? 1 : Math.max(0.4, 1 - (i / snake.length) * 0.5);
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = snakeColor;
    ctx.fillRect(x + pad, y + pad, sz, sz);


    if (isHead) 
    {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(x + pad, y + pad, sz, 3);
    }
    ctx.restore();
  }


  ctx.save();
  ctx.strokeStyle = 'rgba(0,255,136,0.12)';
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, W - 3, H - 3);
  ctx.restore();
}

function updateHUD() {
  scoreEl.textContent = padScore(score);
  bestEl.textContent = padScore(best);
  lengthEl.textContent = padScore(snake.length);
  levelEl.textContent = String(level).padStart(2, '0');
  const pct = (foodEaten / FOOD_PER_LEVEL) * 100;
  xpBarEl.style.width = pct + '%';
  xpLabelEl.textContent = `${foodEaten} / ${FOOD_PER_LEVEL}`;
}

function setStatus(state) 
{
  statusDot.className = 'status-dot';

  if (state === 'active') 
  {
    statusDot.classList.add('active');
    statusText.textContent = 'ACTIVE';
  } 

  else if (state === 'dead') 
  {
    statusDot.classList.add('dead');
    statusText.textContent = 'DEAD';
  } 
  else {
    statusText.textContent = 'READY';
  }
}

window.addEventListener('keydown', e => {
  // Start / restart from keyboard
  if ((e.key === ' ' || e.key === 'Enter') && gameState !== 'playing') {
    e.preventDefault();
    startGame();
    return;
  }

  if (gameState !== 'playing') return;

  switch (e.key) 
  {
    case 'ArrowUp':
    case 'w': case 'W':
      e.preventDefault();
      if (velocity.y !== 1) nextVel = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
    case 's': case 'S':
      e.preventDefault();
      if (velocity.y !== -1) nextVel = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
    case 'a': case 'A':
      e.preventDefault();
      if (velocity.x !== 1) nextVel = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
    case 'd': case 'D':
      e.preventDefault();
      if (velocity.x !== -1) nextVel = { x: 1, y: 0 };
      break;
  }
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

snakePicker.addEventListener('input', () => {
  snakeColor = snakePicker.value;
  snakeHexEl.textContent = snakeColor.toUpperCase();
});
foodPicker.addEventListener('input', () => {
  foodColor = foodPicker.value;
  foodHexEl.textContent = foodColor.toUpperCase();
});

document.querySelectorAll('.speed-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      
    btn.classList.add('active');
    gameSpeed = parseInt(btn.dataset.speed);
    addLog('speed: ' + btn.textContent.toLowerCase(), false);

    if (gameState === 'playing') 
    {
      clearInterval(loopId);
      loopId = setInterval(tick, gameSpeed);
    }
  });
});

(function idleDraw() 
 {
  ctx.fillStyle = '#060a0d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(0,255,136,0.04)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= TILES; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID, 0);
    ctx.lineTo(i * GRID, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * GRID);
    ctx.lineTo(canvas.width, i * GRID);
    ctx.stroke();
  }
})();
