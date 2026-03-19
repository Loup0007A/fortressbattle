# 🏗️ Architecture Technique

## Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    FORTRESS SIEGE                           │
│                 Jeu Multijoueur Temps Réel                  │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
    ┌───▼────┐                            ┌────▼───┐
    │ CLIENT │                            │ SERVER │
    └───┬────┘                            └────┬───┘
        │                                      │
        │          WebSocket (Socket.IO)       │
        └──────────────────┬──────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Game State │
                    │  (Mémoire)  │
                    └─────────────┘
```

---

## 🖥️ Architecture Client (Frontend)

### Structure
```
frontend/
├── index.html      # Structure HTML
├── style.css       # Design responsive
└── game.js         # Logique client + Canvas
```

### Flux de Données Client

```
┌──────────────┐
│   Joueur     │
│  (Input)     │
└──────┬───────┘
       │ Click/Touch
       ▼
┌──────────────────┐
│  Event Handlers  │
│  - handleClick   │
│  - handleDrag    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐        ┌──────────────┐
│   Socket.emit    │───────▶│   Server     │
│   (Action)       │        │              │
└──────────────────┘        └──────┬───────┘
                                   │
       ┌───────────────────────────┘
       │ socket.on (Broadcast)
       ▼
┌──────────────────┐
│  Update State    │
│  gameState =     │
│  newData         │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Render Canvas   │
│  - drawGrid()    │
│  - drawFortress()│
│  - drawWalls()   │
│  - drawTowers()  │
└──────────────────┘
```

### Canvas Rendering

```javascript
// Pipeline de rendu (60 FPS)
requestAnimationFrame() {
  clear()
  ├─ drawGrid()          // Grille de fond
  ├─ drawFortress()      // Forteresse centrale
  ├─ drawWalls()         // Tous les murs
  ├─ drawTowers()        // Toutes les tourelles
  └─ drawEffects()       // Animations
}
```

### Gestion de la Caméra

```
Canvas Viewport (800x600)
┌─────────────────────────────────┐
│                                 │ ◀─── cameraX, cameraY
│    ┌─────────────────┐          │
│    │  Zone Visible   │          │
│    │                 │          │
│    └─────────────────┘          │
│                                 │
└─────────────────────────────────┘
     Carte Complète (40x40 cells)

// Conversion coordonnées
screenX = worldX - cameraX
screenY = worldY - cameraY
```

---

## 🔧 Architecture Serveur (Backend)

### Structure
```
backend/
├── server.js         # Serveur HTTP + Socket.IO
├── gameManager.js    # Logique du jeu
└── config.js         # Configuration
```

### Flux de Données Serveur

```
┌──────────────────┐
│  Client Socket   │
│   (émit action)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│   Socket.IO Server       │
│   io.on('connection')    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│   Event Router           │
│   - placeWall            │
│   - attackStructure      │
│   - switchTeam           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│   GameManager            │
│   - Valider action       │
│   - Modifier state       │
│   - Calculer résultats   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│   io.emit (Broadcast)    │
│   - wallPlaced           │
│   - structureAttacked    │
│   - playerList           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│   Tous les Clients       │
│   (mise à jour en ///)   │
└──────────────────────────┘
```

### Game State (Structure)

```javascript
gameState = {
  fortress: {
    x: 18,           // Position
    y: 18,
    hp: 1000,        // Vie actuelle
    maxHp: 1000
  },
  
  walls: Map {      // key: "x,y"
    "5,10": {
      x: 5,
      y: 10,
      hp: 50,
      maxHp: 50,
      placedBy: "Player1"
    },
    ...
  },
  
  towers: Map {     // key: "x,y"
    "8,12": {
      x: 8,
      y: 12,
      hp: 30,
      maxHp: 30,
      cooldown: 0,
      range: 3,
      placedBy: "Player2"
    },
    ...
  }
}

players = Map {     // key: socketId
  "abc123": {
    id: "abc123",
    username: "Player1",
    team: "defender",
    resources: 50,
    score: 25
  },
  ...
}
```

---

## 🔄 Synchronisation Temps Réel

### Événements WebSocket

```
CLIENT → SERVER
├─ joinGame         { username }
├─ placeWall        { x, y }
├─ placeTower       { x, y }
├─ attackStructure  { x, y }
├─ attackFortress   { }
└─ switchTeam       { }

SERVER → CLIENT
├─ initialState     { fortress, walls, towers, gridSize }
├─ playerJoined     { id, username, team }
├─ playerLeft       { id }
├─ playerList       [ {id, username, team, resources, score}, ... ]
├─ wallPlaced       { x, y, hp, placedBy }
├─ towerPlaced      { x, y, hp, range, placedBy }
├─ structureAttacked { x, y, hp, type, destroyed }
├─ wallDestroyed    { x, y }
├─ towerDestroyed   { x, y }
├─ fortressAttacked { hp, maxHp, destroyed }
├─ towerAttacks     [ {x, y, damage}, ... ]
├─ teamSwitched     { team }
└─ gameOver         { winner }
```

### Timeline d'une Action

```
T=0ms   Joueur clique "Placer Mur"
        └─ Click Handler détecté

T=5ms   socket.emit('placeWall', {x: 10, y: 15})
        └─ Envoi au serveur

T=20ms  Serveur reçoit l'événement
        └─ gameManager.placeWall()
        ├─ Vérifier ressources (>= 10)
        ├─ Vérifier position valide
        ├─ Déduire ressources
        └─ Ajouter mur au state

T=25ms  io.emit('wallPlaced', {...})
        └─ Broadcast à TOUS les clients

T=40ms  Tous les clients reçoivent
        ├─ Ajoutent le mur localement
        └─ Render() pour afficher

Total : ~40ms de latence
```

---

## 🎮 Game Loop

### Loop Côté Serveur

```javascript
// Boucle principale (1 tick = 1 seconde)
setInterval(() => {
  // 1. Tourelles attaquent
  const attacks = gameManager.processTowers()
  io.emit('towerAttacks', attacks)
  
}, 1000)

// Régénération ressources (toutes les 3s)
setInterval(() => {
  gameManager.regenerateResources()
  io.emit('playerList', gameManager.getPlayerList())
}, 3000)
```

### Loop Côté Client

```javascript
// Boucle de rendu (60 FPS)
function gameLoop() {
  render()                    // Dessiner la scène
  requestAnimationFrame(gameLoop)
}

// Pas de logique de jeu côté client !
// Tout est géré serveur (authoritative)
```

---

## 🔐 Sécurité & Validation

### Validation Serveur

```javascript
placeWall(socketId, x, y) {
  // 1. Vérifier que le joueur existe
  const player = this.players.get(socketId)
  if (!player) return { success: false }
  
  // 2. Vérifier l'équipe
  if (player.team !== 'defender') 
    return { success: false }
  
  // 3. Vérifier les ressources
  if (player.resources < this.WALL_COST)
    return { success: false }
  
  // 4. Vérifier la position
  if (!this.isValidPosition(x, y))
    return { success: false }
  
  // 5. Vérifier si occupé
  if (this.state.walls.has(`${x},${y}`))
    return { success: false }
  
  // ✅ Action valide
  // ...
}
```

### Principe "Never Trust the Client"

```
❌ MAUVAIS (Client décide)
Client: "J'ai placé un mur ici"
Server: "OK"
└─ Hackable !

✅ BON (Serveur valide)
Client: "Je VEUX placer un mur ici"
Server: 
  ├─ Vérifie tout
  ├─ Décide si autorisé
  └─ Broadcast SI valide
```

---

## 📊 Optimisations

### Delta Updates

```javascript
// ❌ Envoyer tout le state (lourd)
socket.emit('fullState', {
  fortress: {...},
  walls: [...],      // 100+ objets
  towers: [...],
  players: [...]
})
// Taille : ~50KB

// ✅ Envoyer seulement les changements
socket.emit('wallPlaced', { x: 5, y: 10 })
// Taille : ~50 bytes (1000x plus léger!)
```

### Client-Side Prediction (TODO)

```javascript
// L'action s'affiche immédiatement
function placeWall(x, y) {
  // Rendu local optimiste
  renderWallPreview(x, y)
  
  // Envoyer au serveur
  socket.emit('placeWall', {x, y})
  
  // Si serveur rejette
  socket.on('wallRejected', () => {
    removeWallPreview(x, y)  // Rollback
  })
}
```

### Map-based State

```javascript
// ❌ Array (lent pour accès)
walls = [
  {x: 5, y: 10, ...},
  {x: 8, y: 12, ...},
  ...
]
// Chercher : O(n)

// ✅ Map (rapide)
walls = Map {
  "5,10": {x: 5, y: 10, ...},
  "8,12": {x: 8, y: 12, ...}
}
// Chercher : O(1)
```

---

## 🚀 Scalabilité

### Actuel (Single Instance)

```
┌─────────────┐
│   Node.js   │
│   Process   │
│             │
│ GameState   │ ◀─── En mémoire (RAM)
│ (RAM)       │
└──────┬──────┘
       │
   100-200 joueurs max
```

### Futur (Redis + Multi-Instance)

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Node.js  │  │ Node.js  │  │ Node.js  │
│ Instance │  │ Instance │  │ Instance │
│    1     │  │    2     │  │    3     │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
            ┌──────▼──────┐
            │    Redis    │
            │ (Game State)│ ◀─── Partagé
            └─────────────┘
            
1000+ joueurs possibles
```

---

## 📁 Structure Fichiers Détaillée

```
fortress-siege/
│
├── backend/
│   ├── server.js              # Serveur principal
│   │   ├── Express setup
│   │   ├── Socket.IO config
│   │   ├── Event handlers
│   │   └── Game loops
│   │
│   ├── gameManager.js         # Moteur de jeu
│   │   ├── State management
│   │   ├── Action validation
│   │   ├── Game logic
│   │   └── Player management
│   │
│   ├── config.js              # Configuration
│   │   └── Constantes du jeu
│   │
│   └── package.json
│
├── frontend/
│   ├── index.html             # Interface
│   │   ├── Login screen
│   │   ├── Game screen
│   │   └── Modals
│   │
│   ├── style.css              # Design
│   │   ├── Responsive layout
│   │   ├── Animations
│   │   └── Themes
│   │
│   └── game.js                # Client
│       ├── Socket.IO client
│       ├── Canvas rendering
│       ├── Event handling
│       └── UI updates
│
├── README.md
├── QUICKSTART.md
├── DEPLOYMENT.md
├── ROADMAP.md
├── TESTING.md
└── start.sh
```

---

## 🔧 Technologies Utilisées

### Frontend
- **HTML5 Canvas** : Rendu 2D performant
- **Vanilla JS** : Pas de framework (léger)
- **Socket.IO Client** : WebSocket temps réel
- **CSS3** : Animations & responsive

### Backend
- **Node.js** : Serveur JavaScript
- **Express** : Framework HTTP
- **Socket.IO** : WebSocket bidirectionnel
- **Map/Set** : Structures de données natives

### Pourquoi ces choix ?

✅ **Vanilla JS** au lieu de React
- Moins de dépendances
- Plus rapide à charger
- Canvas fonctionne mieux en vanilla

✅ **Socket.IO** au lieu de WebSocket natif
- Fallback automatique (long polling)
- Reconnexion auto
- Rooms & namespaces

✅ **Map/Set** au lieu d'objets
- Performance O(1)
- Itération plus rapide
- API plus propre

✅ **Canvas** au lieu de DOM
- 60 FPS garanti
- 1000+ objets affichables
- Transformations rapides

---

## 🎯 Patterns de Design

### Authoritative Server
Le serveur est la source de vérité. Le client ne fait que :
- Afficher
- Envoyer des intentions
- Recevoir la vérité

### Event-Driven Architecture
Tout communique par événements :
```
Action → Event → Reaction
```

### Single Source of Truth
Un seul state, géré serveur, synchronisé partout.

### Observer Pattern
Les clients observent le state serveur et réagissent aux changements.

---

**Questions ?** Ouvre une issue sur GitHub ! 🚀
