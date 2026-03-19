# 🐛 Guide de Debugging & Troubleshooting

## 🔍 Outils de Debugging

### Console Serveur
```bash
cd backend
npm start

# Voir tous les logs
DEBUG=* npm start

# Logs Socket.IO uniquement
DEBUG=socket.io* npm start
```

### Console Navigateur
```
F12 → Console
```

Logs utiles :
```javascript
console.log('Joueur connecté:', socket.id)
console.log('Game State:', gameState)
console.log('Event reçu:', eventName, data)
```

### DevTools Network
```
F12 → Network → WS (WebSocket)
```
Voir tous les messages Socket.IO en temps réel.

---

## ⚠️ Problèmes Courants

### 1. "Cannot connect to server"

**Symptômes** :
- Écran de connexion bloqué
- Console : "WebSocket connection failed"

**Solutions** :
```bash
# Vérifier que le serveur tourne
curl http://localhost:3000
# Devrait retourner du HTML

# Vérifier le port
netstat -an | grep 3000

# Redémarrer le serveur
cd backend
npm start
```

**Cause possible** :
- Serveur pas démarré
- Mauvais port dans game.js
- Firewall bloque WebSocket

---

### 2. "Canvas is blank / black screen"

**Symptômes** :
- Écran noir après connexion
- Pas de grille visible

**Solutions** :
```javascript
// 1. Ouvrir Console (F12)
// Chercher erreurs JavaScript

// 2. Vérifier gameState
console.log(gameState)
// Devrait avoir fortress, walls, towers

// 3. Forcer le rendu
render()

// 4. Vérifier la caméra
console.log(cameraX, cameraY)
// Si trop grand → centrer
centerCameraOnFortress()
```

**Fixes rapides** :
- Refresh page (Ctrl+R)
- Vider cache (Ctrl+Shift+R)
- Réduire zoom navigateur (Ctrl+0)

---

### 3. "Actions don't work"

**Symptômes** :
- Clic sur canvas ne fait rien
- Boutons actions inactifs

**Debug** :
```javascript
// Console navigateur
socket.on('wallPlaced', (data) => {
  console.log('Mur placé !', data)
})

socket.on('error', (err) => {
  console.error('Erreur serveur:', err)
})

// Vérifier les ressources
console.log(playerData.resources)
// Si < coût → normal que ça ne marche pas

// Vérifier l'équipe
console.log(playerData.team)
// Défenseur = walls/towers
// Attaquant = attack
```

**Vérifications** :
- [ ] Action sélectionnée ? (bouton surligné)
- [ ] Assez de ressources ?
- [ ] Bonne équipe ?
- [ ] Position valide (pas dans forteresse) ?

---

### 4. "Players not synchronized"

**Symptômes** :
- Joueur A voit différent de joueur B
- Structures apparaissent/disparaissent

**Debug serveur** :
```javascript
// gameManager.js - ajouter logs
placeWall(socketId, x, y) {
  console.log(`[WALL] Player ${socketId} placing at ${x},${y}`)
  // ...
  console.log('[WALL] Broadcast to', io.sockets.sockets.size, 'clients')
}
```

**Debug client** :
```javascript
// game.js
socket.on('wallPlaced', (data) => {
  console.log('[SYNC] Wall received:', data)
  console.log('[SYNC] Total walls now:', gameState.walls.length)
})
```

**Solutions** :
- Vérifier que `io.emit()` est utilisé (pas `socket.emit()`)
- Vérifier les events listeners côté client
- Forcer refresh état : `socket.emit('requestState')`

---

### 5. "Memory leak / Performance"

**Symptômes** :
- Jeu ralentit après 5-10 min
- RAM monte continuellement
- FPS drop

**Profiling Chrome** :
```
F12 → Performance → Record
Jouer 30 secondes
Stop → Analyser
```

**Checks** :
```javascript
// 1. Vérifier nombre d'event listeners
console.log(socket.listeners('wallPlaced').length)
// Si > 1 → Problème !

// 2. Cleanup à la déconnexion
socket.on('disconnect', () => {
  // Enlever tous les listeners
  socket.removeAllListeners()
})

// 3. Limiter les rendus
let lastRender = 0
function render() {
  const now = Date.now()
  if (now - lastRender < 16) return // Max 60 FPS
  lastRender = now
  // ...
}
```

---

### 6. "Mobile controls not working"

**Symptômes** :
- Touch ne fonctionne pas
- Drag ne bouge pas la caméra

**Debug** :
```javascript
// Vérifier les events touch
canvas.addEventListener('touchstart', (e) => {
  console.log('Touch detected:', e.touches.length)
  e.preventDefault() // Très important !
})
```

**Fixes** :
```css
/* style.css - désactiver le zoom pinch */
canvas {
  touch-action: none;
}
```

---

## 🔧 Debugging Avancé

### Socket.IO Inspector

```javascript
// Activer le debug Socket.IO
localStorage.debug = 'socket.io-client:socket'
location.reload()

// Voir tous les events
socket.onAny((eventName, ...args) => {
  console.log(`[EVENT] ${eventName}:`, args)
})

// Compter les events
let eventCount = {}
socket.onAny((eventName) => {
  eventCount[eventName] = (eventCount[eventName] || 0) + 1
  console.table(eventCount)
})
```

### State Inspector

```javascript
// Ajouter au window pour debug
window.debug = {
  state: gameState,
  player: playerData,
  players: players,
  socket: socket,
  
  // Helpers
  showFortress() {
    console.log('Forteresse:', this.state.fortress)
  },
  
  showWalls() {
    console.table(this.state.walls)
  },
  
  giveResources(amount) {
    playerData.resources = amount
    updateUI()
  },
  
  teleportCamera(x, y) {
    cameraX = x * CELL_SIZE
    cameraY = y * CELL_SIZE
    render()
  }
}

// Usage console
debug.showWalls()
debug.giveResources(999)
debug.teleportCamera(20, 20)
```

### Performance Monitoring

```javascript
// FPS Counter
let fps = 0
let lastTime = performance.now()
let frameCount = 0

function countFPS() {
  frameCount++
  const now = performance.now()
  
  if (now - lastTime >= 1000) {
    fps = frameCount
    frameCount = 0
    lastTime = now
    console.log('FPS:', fps)
  }
  
  requestAnimationFrame(countFPS)
}
countFPS()

// Afficher dans UI
document.getElementById('fpsDisplay').textContent = `FPS: ${fps}`
```

---

## 📊 Monitoring Production

### Logs Serveur (PM2)

```bash
# Logs en temps réel
pm2 logs fortress-siege

# Logs avec timestamps
pm2 logs fortress-siege --timestamp

# Monitoring ressources
pm2 monit

# Stats
pm2 show fortress-siege
```

### Health Check

```javascript
// server.js - endpoint health
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now(),
    players: gameManager.players.size,
    walls: gameManager.state.walls.size,
    towers: gameManager.state.towers.size,
    memory: process.memoryUsage()
  }
  res.json(health)
})

// Tester
curl http://localhost:3000/health
```

### Metrics Custom

```javascript
// gameManager.js
class GameManager {
  constructor(io) {
    // ...
    this.metrics = {
      wallsPlaced: 0,
      towersPlaced: 0,
      attacksMade: 0,
      playersJoined: 0
    }
  }
  
  placeWall() {
    // ...
    this.metrics.wallsPlaced++
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      activePlayers: this.players.size,
      uptime: process.uptime()
    }
  }
}

// Endpoint metrics
app.get('/metrics', (req, res) => {
  res.json(gameManager.getMetrics())
})
```

---

## 🚨 Error Tracking

### Sentry Integration (optionnel)

```bash
npm install @sentry/node --save
```

```javascript
// server.js
const Sentry = require("@sentry/node")

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: process.env.NODE_ENV
})

// Capturer les erreurs
io.on('connection', (socket) => {
  try {
    // ...
  } catch (error) {
    Sentry.captureException(error)
    console.error(error)
  }
})
```

---

## 📝 Checklist de Debug

### Avant de demander de l'aide :

- [ ] Console navigateur vérifiée (F12)
- [ ] Logs serveur vérifiés
- [ ] Cache navigateur vidé (Ctrl+Shift+R)
- [ ] Node.js et npm à jour
- [ ] Dépendances installées (`npm install`)
- [ ] Port 3000 libre
- [ ] Testé sur navigateur différent
- [ ] Testé en mode incognito

### Informations à fournir :

```
OS : 
Browser : 
Node version : 
Étapes de reproduction :
1. 
2. 
3. 

Erreur exacte :
```

Logs serveur :
```
[copier ici]
```

```
Logs client (F12) :
```
[copier ici]
```

---

## 🎯 Tests Rapides

### Test Connexion

```javascript
// Console navigateur
socket.connected // true = OK
socket.id        // "abc123..." = OK
```

### Test Broadcast

```javascript
// Onglet 1
socket.emit('placeWall', {x: 10, y: 10})

// Onglet 2 - devrait recevoir
socket.on('wallPlaced', (data) => {
  console.log('Reçu !', data)
})
```

### Test Performance

```bash
# Load testing simple
npm install -g loadtest

loadtest -c 10 -n 1000 http://localhost:3000
# 10 connexions concurrentes
# 1000 requêtes total
```

---

## 💡 Tips Pro

### Raccourcis Debug

```javascript
// game.js - Mode debug
const DEBUG = true

if (DEBUG) {
  window.game = {
    state: gameState,
    render,
    socket,
    // ...
  }
  
  // Grid overlay
  if (DEBUG) {
    ctx.strokeStyle = 'red'
    ctx.strokeRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE)
  }
}
```

### Conditional Logging

```javascript
const log = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[GAME]', ...args)
  }
}

// Usage
log('Player joined:', player.username)
```

---

**Toujours un problème ?** 
Ouvre une issue sur GitHub avec :
- Version Node.js
- OS & navigateur
- Logs complets
- Étapes exactes

🚀 Happy debugging !
