// Configuration
const BACKEND_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : window.location.origin;

const CELL_SIZE = 16;
const COLORS = {
  bg: '#0a0a15',
  grid: '#1a1a2e',
  fortress: '#ff6b6b',
  wall: '#666',
  wallDamaged: '#999',
  tower: '#4ecdc4',
  towerRange: 'rgba(78, 205, 196, 0.1)',
  defender: '#4ecdc4',
  attacker: '#ff6b6b',
  fortressGlow: 'rgba(255, 107, 107, 0.3)'
};

// État global
let socket = null;
let gameState = {
  fortress: null,
  walls: [],
  towers: [],
  gridSize: 40
};
let playerData = {
  team: 'attacker',
  resources: 50,
  score: 0
};
let players = [];
let selectedAction = null;
let canvas, ctx;
let cameraX = 0, cameraY = 0;
let scale = 1;
let isDragging = false;
let lastMouseX = 0, lastMouseY = 0;

// Éléments DOM
const loginScreen = document.getElementById('loginScreen');
const gameScreen = document.getElementById('gameScreen');
const usernameInput = document.getElementById('usernameInput');
const joinBtn = document.getElementById('joinBtn');
const teamBadge = document.getElementById('teamBadge');
const switchTeamBtn = document.getElementById('switchTeamBtn');
const fortressHpBar = document.getElementById('fortressHpBar');
const fortressHpText = document.getElementById('fortressHpText');
const resourcesText = document.getElementById('resourcesText');
const scoreText = document.getElementById('scoreText');
const playerList = document.getElementById('playerList');
const playerCount = document.getElementById('playerCount');
const defenderActions = document.getElementById('defenderActions');
const attackerActions = document.getElementById('attackerActions');
const gameOverModal = document.getElementById('gameOver');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverText = document.getElementById('gameOverText');
const countdownSpan = document.getElementById('countdown');

// Initialisation
function init() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  
  // Resize canvas
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Événements de connexion
  joinBtn.addEventListener('click', joinGame);
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinGame();
  });

  // Événements de jeu
  switchTeamBtn.addEventListener('click', switchTeam);

  // Actions
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAction = btn.dataset.action;
    });
  });

  // Canvas interactions
  canvas.addEventListener('click', handleCanvasClick);
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('wheel', handleWheel, { passive: false });

  // Touch support
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd);

  // Focus sur l'input
  usernameInput.focus();
}

function resizeCanvas() {
  const container = document.getElementById('gameContainer');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  
  // Centrer la caméra sur la forteresse
  if (gameState.fortress) {
    centerCameraOnFortress();
  }
  
  render();
}

function centerCameraOnFortress() {
  if (!gameState.fortress) return;
  
  const fortressCenterX = (gameState.fortress.x + 2) * CELL_SIZE;
  const fortressCenterY = (gameState.fortress.y + 2) * CELL_SIZE;
  
  cameraX = fortressCenterX - canvas.width / 2;
  cameraY = fortressCenterY - canvas.height / 2;
}

// Connexion au jeu
function joinGame() {
  const username = usernameInput.value.trim();
  if (!username) {
    showNotification('Entre un pseudo !', 'error');
    return;
  }

  // Connexion Socket.IO
  socket = io(BACKEND_URL);

  socket.on('connect', () => {
    console.log('Connecté au serveur');
    socket.emit('joinGame', username);
  });

  socket.on('initialState', (state) => {
    gameState = state;
    centerCameraOnFortress();
    loginScreen.classList.remove('active');
    gameScreen.classList.add('active');
    render();
  });

  socket.on('playerJoined', (player) => {
    if (player.id === socket.id) {
      playerData.team = player.team;
      updateTeamUI();
    }
    showNotification(`${player.username} a rejoint (${player.team})`, 'success');
  });

  socket.on('playerLeft', (playerId) => {
    players = players.filter(p => p.id !== playerId);
    updatePlayerList();
  });

  socket.on('playerList', (list) => {
    players = list;
    const currentPlayer = players.find(p => p.id === socket.id);
    if (currentPlayer) {
      playerData = currentPlayer;
      updateUI();
    }
    updatePlayerList();
  });

  socket.on('wallPlaced', (data) => {
    gameState.walls.push(data);
    render();
    playSound('place');
  });

  socket.on('towerPlaced', (data) => {
    gameState.towers.push(data);
    render();
    playSound('place');
  });

  socket.on('structureAttacked', (data) => {
    if (!data.destroyed) {
      // Mettre à jour HP
      if (data.type === 'wall') {
        const wall = gameState.walls.find(w => w.x === data.x && w.y === data.y);
        if (wall) wall.hp = data.hp;
      } else {
        const tower = gameState.towers.find(t => t.x === data.x && t.y === data.y);
        if (tower) tower.hp = data.hp;
      }
    }
    render();
    playSound('hit');
  });

  socket.on('wallDestroyed', (data) => {
    gameState.walls = gameState.walls.filter(w => !(w.x === data.x && w.y === data.y));
    render();
    playSound('destroy');
  });

  socket.on('towerDestroyed', (data) => {
    gameState.towers = gameState.towers.filter(t => !(t.x === data.x && t.y === data.y));
    render();
    playSound('destroy');
  });

  socket.on('fortressAttacked', (data) => {
    gameState.fortress.hp = data.hp;
    updateFortressHP();
    render();
    playSound('hit');
  });

  socket.on('towerAttacks', (attacks) => {
    // Animation visuelle des tourelles qui tirent
    attacks.forEach(attack => {
      createTowerAttackEffect(attack.x, attack.y);
    });
  });

  socket.on('teamSwitched', (data) => {
    playerData.team = data.team;
    updateTeamUI();
    showNotification(`Tu es maintenant ${data.team === 'defender' ? 'Défenseur 🛡️' : 'Attaquant ⚔️'}`, 'success');
  });

  socket.on('gameOver', (data) => {
    showGameOver(data.winner);
  });

  socket.on('disconnect', () => {
    showNotification('Déconnecté du serveur', 'error');
  });
}

// Changer d'équipe
function switchTeam() {
  if (!socket) return;
  socket.emit('switchTeam');
}

// Mise à jour UI
function updateTeamUI() {
  teamBadge.textContent = playerData.team === 'defender' ? '🛡️ Défenseur' : '⚔️ Attaquant';
  teamBadge.className = `team-badge ${playerData.team}`;

  defenderActions.classList.toggle('active', playerData.team === 'defender');
  attackerActions.classList.toggle('active', playerData.team === 'attacker');

  selectedAction = null;
  document.querySelectorAll('.action-btn').forEach(b => b.classList.remove('selected'));
}

function updateUI() {
  resourcesText.textContent = playerData.resources;
  scoreText.textContent = playerData.score;
  updateFortressHP();
}

function updateFortressHP() {
  if (!gameState.fortress) return;
  const percent = (gameState.fortress.hp / gameState.fortress.maxHp) * 100;
  fortressHpBar.style.width = percent + '%';
  fortressHpText.textContent = `${gameState.fortress.hp}/${gameState.fortress.maxHp}`;
}

function updatePlayerList() {
  playerCount.textContent = players.length;
  
  const defenders = players.filter(p => p.team === 'defender');
  const attackers = players.filter(p => p.team === 'attacker');

  playerList.innerHTML = `
    <div style="margin-bottom: 0.5rem; font-weight: bold; color: ${COLORS.defender}">
      🛡️ Défenseurs (${defenders.length})
    </div>
    ${defenders.map(p => `
      <div class="player-item defender">
        <span class="player-name">${p.username}</span>
        <div class="player-stats">
          <span>💰${p.resources}</span>
          <span>⭐${p.score}</span>
        </div>
      </div>
    `).join('')}
    
    <div style="margin: 1rem 0 0.5rem 0; font-weight: bold; color: ${COLORS.attacker}">
      ⚔️ Attaquants (${attackers.length})
    </div>
    ${attackers.map(p => `
      <div class="player-item attacker">
        <span class="player-name">${p.username}</span>
        <div class="player-stats">
          <span>💰${p.resources}</span>
          <span>⭐${p.score}</span>
        </div>
      </div>
    `).join('')}
  `;
}

// Rendu Canvas
function render() {
  if (!ctx) return;

  // Clear
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  // Grille
  drawGrid();

  // Forteresse
  drawFortress();

  // Structures
  gameState.walls.forEach(wall => drawWall(wall));
  gameState.towers.forEach(tower => drawTower(tower));

  ctx.restore();
}

function drawGrid() {
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;

  const startX = Math.floor(cameraX / CELL_SIZE);
  const startY = Math.floor(cameraY / CELL_SIZE);
  const endX = Math.ceil((cameraX + canvas.width) / CELL_SIZE);
  const endY = Math.ceil((cameraY + canvas.height) / CELL_SIZE);

  for (let x = startX; x <= endX; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL_SIZE, startY * CELL_SIZE);
    ctx.lineTo(x * CELL_SIZE, endY * CELL_SIZE);
    ctx.stroke();
  }

  for (let y = startY; y <= endY; y++) {
    ctx.beginPath();
    ctx.moveTo(startX * CELL_SIZE, y * CELL_SIZE);
    ctx.lineTo(endX * CELL_SIZE, y * CELL_SIZE);
    ctx.stroke();
  }
}

function drawFortress() {
  if (!gameState.fortress) return;

  const x = gameState.fortress.x * CELL_SIZE;
  const y = gameState.fortress.y * CELL_SIZE;
  const size = 4 * CELL_SIZE;

  // Glow effect
  ctx.shadowBlur = 20;
  ctx.shadowColor = COLORS.fortressGlow;

  // Forteresse
  ctx.fillStyle = COLORS.fortress;
  ctx.fillRect(x, y, size, size);

  // Border
  ctx.strokeStyle = '#ff8787';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, size, size);

  // Icône château
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'white';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏰', x + size / 2, y + size / 2);
}

function drawWall(wall) {
  const x = wall.x * CELL_SIZE;
  const y = wall.y * CELL_SIZE;

  // Couleur selon HP
  const hpPercent = wall.hp / wall.maxHp;
  ctx.fillStyle = hpPercent > 0.5 ? COLORS.wall : COLORS.wallDamaged;
  ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

  // Border
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

  // HP bar
  if (hpPercent < 1) {
    ctx.fillStyle = '#333';
    ctx.fillRect(x + 2, y + CELL_SIZE - 4, CELL_SIZE - 4, 2);
    ctx.fillStyle = hpPercent > 0.5 ? '#51cf66' : '#ffd93d';
    ctx.fillRect(x + 2, y + CELL_SIZE - 4, (CELL_SIZE - 4) * hpPercent, 2);
  }
}

function drawTower(tower) {
  const x = tower.x * CELL_SIZE + CELL_SIZE / 2;
  const y = tower.y * CELL_SIZE + CELL_SIZE / 2;
  const radius = CELL_SIZE / 2 - 2;

  // Range indicator (si hover)
  // ctx.fillStyle = COLORS.towerRange;
  // ctx.beginPath();
  // ctx.arc(x, y, tower.range * CELL_SIZE, 0, Math.PI * 2);
  // ctx.fill();

  // Tourelle
  ctx.fillStyle = COLORS.tower;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Border
  ctx.strokeStyle = '#5ee7df';
  ctx.lineWidth = 2;
  ctx.stroke();

  // HP bar
  const hpPercent = tower.hp / tower.maxHp;
  if (hpPercent < 1) {
    const barWidth = CELL_SIZE - 4;
    const barX = tower.x * CELL_SIZE + 2;
    const barY = tower.y * CELL_SIZE + CELL_SIZE - 4;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, 2);
    ctx.fillStyle = hpPercent > 0.5 ? '#51cf66' : '#ffd93d';
    ctx.fillRect(barX, barY, barWidth * hpPercent, 2);
  }
}

// Interactions Canvas
function handleCanvasClick(e) {
  if (!socket || !selectedAction) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left + cameraX;
  const clickY = e.clientY - rect.top + cameraY;

  const gridX = Math.floor(clickX / CELL_SIZE);
  const gridY = Math.floor(clickY / CELL_SIZE);

  if (selectedAction === 'wall') {
    socket.emit('placeWall', { x: gridX, y: gridY });
  } else if (selectedAction === 'tower') {
    socket.emit('placeTower', { x: gridX, y: gridY });
  } else if (selectedAction === 'attack') {
    socket.emit('attackStructure', { x: gridX, y: gridY });
  } else if (selectedAction === 'attackFortress') {
    socket.emit('attackFortress', { x: gridX, y: gridY });
  }
}

// Camera controls
function handleMouseDown(e) {
  isDragging = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  canvas.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
  if (!isDragging) return;

  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;

  cameraX -= dx;
  cameraY -= dy;

  lastMouseX = e.clientX;
  lastMouseY = e.clientY;

  render();
}

function handleMouseUp() {
  isDragging = false;
  canvas.style.cursor = 'crosshair';
}

function handleWheel(e) {
  e.preventDefault();
  // Zoom désactivé pour simplicité, mais peut être ajouté
}

// Touch support
let touchStartX = 0, touchStartY = 0;
let isTouching = false;

function handleTouchStart(e) {
  e.preventDefault();
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isTouching = true;
  }
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!isTouching || e.touches.length !== 1) return;

  const touch = e.touches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  cameraX -= dx;
  cameraY -= dy;

  touchStartX = touch.clientX;
  touchStartY = touch.clientY;

  render();
}

function handleTouchEnd(e) {
  if (e.touches.length === 0) {
    isTouching = false;
    
    // Si c'était un tap (pas un drag), traiter comme un clic
    if (selectedAction && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const rect = canvas.getBoundingClientRect();
      const clickX = touch.clientX - rect.left + cameraX;
      const clickY = touch.clientY - rect.top + cameraY;

      const gridX = Math.floor(clickX / CELL_SIZE);
      const gridY = Math.floor(clickY / CELL_SIZE);

      if (selectedAction === 'wall') {
        socket.emit('placeWall', { x: gridX, y: gridY });
      } else if (selectedAction === 'tower') {
        socket.emit('placeTower', { x: gridX, y: gridY });
      } else if (selectedAction === 'attack') {
        socket.emit('attackStructure', { x: gridX, y: gridY });
      } else if (selectedAction === 'attackFortress') {
        socket.emit('attackFortress', { x: gridX, y: gridY });
      }
    }
  }
}

// Effets visuels
function createTowerAttackEffect(x, y) {
  // Animation simple de tir (pourrait être améliorée)
  const posX = x * CELL_SIZE + CELL_SIZE / 2 - cameraX;
  const posY = y * CELL_SIZE + CELL_SIZE / 2 - cameraY;
  
  // Créer une petite explosion visuelle
  ctx.save();
  ctx.fillStyle = 'rgba(78, 205, 196, 0.5)';
  ctx.beginPath();
  ctx.arc(posX, posY, CELL_SIZE, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  setTimeout(() => render(), 100);
}

// Notifications
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.getElementById('notifications').appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Game Over
function showGameOver(winner) {
  gameOverTitle.textContent = winner === 'attackers' ? '⚔️ VICTOIRE ATTAQUANTS !' : '🛡️ VICTOIRE DÉFENSEURS !';
  gameOverText.textContent = winner === 'attackers' 
    ? 'La forteresse a été détruite !' 
    : 'La forteresse a résisté !';
  
  gameOverModal.classList.add('active');
  
  let countdown = 5;
  countdownSpan.textContent = countdown;
  
  const interval = setInterval(() => {
    countdown--;
    countdownSpan.textContent = countdown;
    if (countdown <= 0) {
      clearInterval(interval);
      gameOverModal.classList.remove('active');
    }
  }, 1000);
}

// Sons (simple)
function playSound(type) {
  // AudioContext pour sons simples
  // Pour une vraie version, utiliser des fichiers audio
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  if (type === 'place') {
    oscillator.frequency.value = 440;
    gainNode.gain.value = 0.1;
  } else if (type === 'hit') {
    oscillator.frequency.value = 220;
    gainNode.gain.value = 0.15;
  } else if (type === 'destroy') {
    oscillator.frequency.value = 110;
    gainNode.gain.value = 0.2;
  }
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
}

// Démarrage
window.addEventListener('DOMContentLoaded', init);
