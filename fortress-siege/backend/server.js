const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const GameManager = require('./gameManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Instance unique du jeu mondial
const gameManager = new GameManager(io);

// Middleware - Servir le frontend
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

// Connexion des joueurs
io.on('connection', (socket) => {
  console.log(`Joueur connecté: ${socket.id}`);
  
  // Envoyer l'état complet du jeu au nouveau joueur
  socket.emit('initialState', gameManager.getState());
  socket.emit('playerList', gameManager.getPlayerList());
  
  // Enregistrer le nouveau joueur
  socket.on('joinGame', (username) => {
    gameManager.addPlayer(socket.id, username);
    io.emit('playerJoined', {
      id: socket.id,
      username: username,
      team: gameManager.players.get(socket.id).team
    });
    io.emit('playerList', gameManager.getPlayerList());
  });

  // Actions des joueurs
  socket.on('placeWall', (data) => {
    const result = gameManager.placeWall(socket.id, data.x, data.y);
    if (result.success) {
      io.emit('wallPlaced', result.data);
      io.emit('playerList', gameManager.getPlayerList());
    }
  });

  socket.on('placeTower', (data) => {
    const result = gameManager.placeTower(socket.id, data.x, data.y);
    if (result.success) {
      io.emit('towerPlaced', result.data);
      io.emit('playerList', gameManager.getPlayerList());
    }
  });

  socket.on('attackStructure', (data) => {
    const result = gameManager.attackStructure(socket.id, data.x, data.y);
    if (result.success) {
      io.emit('structureAttacked', result.data);
      if (result.data.destroyed) {
        io.emit(result.data.type === 'wall' ? 'wallDestroyed' : 'towerDestroyed', {
          x: data.x,
          y: data.y
        });
      }
      io.emit('playerList', gameManager.getPlayerList());
    }
  });

  socket.on('attackFortress', (data) => {
    const result = gameManager.attackFortress(socket.id);
    if (result.success) {
      io.emit('fortressAttacked', result.data);
      io.emit('playerList', gameManager.getPlayerList());
      
      if (result.data.destroyed) {
        io.emit('gameOver', { winner: 'attackers' });
        setTimeout(() => {
          gameManager.resetGame();
          io.emit('initialState', gameManager.getState());
          io.emit('playerList', gameManager.getPlayerList());
        }, 5000);
      }
    }
  });

  socket.on('switchTeam', () => {
    const result = gameManager.switchTeam(socket.id);
    if (result.success) {
      io.emit('playerList', gameManager.getPlayerList());
      socket.emit('teamSwitched', result.data);
    }
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log(`Joueur déconnecté: ${socket.id}`);
    gameManager.removePlayer(socket.id);
    io.emit('playerLeft', socket.id);
    io.emit('playerList', gameManager.getPlayerList());
  });
});

// Boucle de jeu (tourelles tirent automatiquement)
setInterval(() => {
  const attacks = gameManager.processTowers();
  if (attacks.length > 0) {
    io.emit('towerAttacks', attacks);
  }
}, 1000);

// Régénération des ressources
setInterval(() => {
  gameManager.regenerateResources();
  io.emit('playerList', gameManager.getPlayerList());
}, 3000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏰 FORTRESS SIEGE - Serveur Démarré');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n🌐 URL locale :  http://localhost:${PORT}`);
  console.log(`🌐 URL réseau :  http://[votre-ip]:${PORT}`);
  console.log('\n📱 Partage l\'URL pour jouer avec d\'autres !');
  console.log('⚡ Carte mondiale unique - Temps réel');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});
