# 🏰 FORTRESS SIEGE
## Jeu Multijoueur Temps Réel - Carte Mondiale Unique

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org)

---

## 🎯 C'est Quoi ?

Un jeu de stratégie où **TOUS les joueurs du monde partagent la MÊME carte en temps réel** !

- 🌍 **Une seule carte** pour tout le monde
- ⚔️ **Deux équipes** : Défenseurs 🛡️ vs Attaquants ⚔️
- ⚡ **Temps réel** : Actions instantanées
- 📱 **Mobile + Desktop** : Jouable partout

---

## ⚡ DÉMARRAGE ULTRA RAPIDE

### Option 1 : Script Automatique (Recommandé)

```bash
./start.sh
```

Puis ouvre : **http://localhost:3000** 🎮

### Option 2 : Manuel (3 commandes)

```bash
cd backend
npm install
npm start
```

Puis ouvre : **http://localhost:3000** 🎮

**C'EST TOUT !** Le jeu tourne maintenant sur ton ordi.

---

## 🎮 Comment Jouer ?

### Étape 1 : Connexion
- Ouvre http://localhost:3000
- Entre ton pseudo
- Clique "REJOINDRE LA BATAILLE"

### Étape 2 : Choisir ton Camp

**🛡️ DÉFENSEUR**
- Protège la forteresse (centre rouge)
- Place des murs (10💰) et tourelles (25💰)
- Stratégie : Construis des cercles défensifs

**⚔️ ATTAQUANT**
- Détruis la forteresse !
- Attaque structures (5💰) ou forteresse (10💰)
- Stratégie : Coordonne avec les autres attaquants

### Étape 3 : Gagner
- **Attaquants gagnent** : Forteresse à 0 HP
- **Défenseurs gagnent** : Résister indéfiniment

💰 **Ressources** : +2 toutes les 3 secondes (max 100)

---

## 📱 Jouer avec des Amis

### Sur le Même WiFi

1. Lance le serveur sur ton ordi
2. Trouve ton IP locale :
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux  
   ifconfig | grep "inet "
   ```
3. Partage l'URL avec tes amis : `http://TON-IP:3000`

Exemple : `http://192.168.1.45:3000`

### Sur Internet

Utilise **ngrok** (gratuit) :
```bash
npm install -g ngrok
ngrok http 3000
```

Tu reçois une URL publique type : `https://abc123.ngrok.io`
Partage-la à tes amis ! 🌍

---

## 🎨 Captures d'Écran

### Écran de Connexion
```
┌─────────────────────────────┐
│  🏰 FORTRESS SIEGE          │
│                             │
│  [Ton pseudo ici___]        │
│                             │
│  [REJOINDRE LA BATAILLE]    │
└─────────────────────────────┘
```

### Jeu en Action
```
🛡️ Défenseur              🏰 850/1000    💰 45
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        
        🗼    🧱    🗼
             
       🧱    🏰    🧱
             
        🗼    🧱    🗼
        
Actions:           Joueurs (8)
[🧱 Mur 10💰]      Player1 🛡️ ⭐30
[🗼 Tour 25💰]     Player2 ⚔️ ⭐15
```

---

## 🏆 Fonctionnalités

### ✅ Actuelles
- ✅ Carte mondiale unique
- ✅ Synchronisation temps réel (<100ms)
- ✅ Système d'équipes
- ✅ Murs et tourelles
- ✅ Attaques et destruction
- ✅ Ressources auto-régénération
- ✅ Scores joueurs
- ✅ Interface responsive
- ✅ Support mobile (touch)

### 🚧 Bientôt
- [ ] Comptes utilisateurs
- [ ] Leaderboard global
- [ ] Chat in-game
- [ ] Power-ups temporaires

---

## 🔧 Configuration

### Modifier la Difficulté

Édite `backend/config.js` :

```javascript
module.exports = {
  WALL_HP: 50,          // Vie des murs
  TOWER_DAMAGE: 5,      // Dégâts tourelles
  RESOURCE_REGEN: 2,    // Vitesse ressources
  // ...
}
```

### Changer les Couleurs

Édite `frontend/game.js` ligne 5 :

```javascript
const COLORS = {
  fortress: '#ff6b6b',  // Rouge
  tower: '#4ecdc4',     // Cyan
  wall: '#666',         // Gris
  // ...
}
```

---

## 📚 Documentation Complète

| Fichier | Description |
|---------|-------------|
| **[QUICKSTART.md](QUICKSTART.md)** | Guide de démarrage 3 min ⚡ |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Déployer en production 🚀 |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | Architecture technique 🏗️ |
| **[ROADMAP.md](ROADMAP.md)** | Fonctionnalités futures 🗺️ |
| **[DEBUGGING.md](DEBUGGING.md)** | Résoudre les problèmes 🐛 |
| **[TESTING.md](TESTING.md)** | Guide de tests 🧪 |

---

## 🐛 Problèmes Courants

### "Cannot find module 'express'"
```bash
cd backend
npm install
```

### "Port 3000 déjà utilisé"
```bash
# Tuer le process
lsof -ti:3000 | xargs kill -9

# OU changer le port dans backend/server.js
```

### "Canvas noir / vide"
- Refresh la page (Ctrl+R)
- Vide le cache (Ctrl+Shift+R)
- Vérifie la console (F12)

Plus d'aide → [DEBUGGING.md](DEBUGGING.md)

---

## 🚀 Déploiement Production

### Railway (Gratuit & Simple)

1. Push sur GitHub
2. Connecte Railway à ton repo
3. Deploy automatique !

Guide complet → [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📊 Stack Technique

| Composant | Techno | Pourquoi |
|-----------|--------|----------|
| Frontend | Vanilla JS + Canvas | Léger, rapide, 60 FPS |
| Backend | Node.js + Express | Scalable, async |
| Temps Réel | Socket.IO | WebSocket + fallbacks |
| État | Map/Set (RAM) | Performance O(1) |

**Lignes de code** : ~2000 LOC
**Dépendances** : 2 (express, socket.io)
**Taille** : <100 KB

---

## 🤝 Contribution

Les Pull Requests sont bienvenues ! 

1. Fork le projet
2. Crée une branche (`git checkout -b feature/cool`)
3. Commit (`git commit -m 'Add cool feature'`)
4. Push (`git push origin feature/cool`)
5. Ouvre une Pull Request

Voir [ROADMAP.md](ROADMAP.md) pour des idées.

---

## 📜 Licence

MIT License - Libre d'utilisation commerciale et personnelle.

Voir [LICENSE](LICENSE) pour détails.

---

## 🎯 Pourquoi ce Projet ?

### Objectifs
- ✅ Prouver qu'on peut faire du multijoueur sans framework lourd
- ✅ Éduquer sur WebSocket et temps réel
- ✅ Créer un jeu fun et addictif
- ✅ Code simple et compréhensible

### Innovations
- 🌍 Carte mondiale unique (pas de lobbies)
- 🎮 Vanilla JS (pas de React/Vue)
- ⚡ Canvas optimisé (60 FPS)
- 📖 Architecture simple (facile à comprendre)

---

## ❤️ Remerciements

- Socket.IO pour leur excellente bibliothèque
- La communauté JavaScript
- Tous les beta-testeurs
- **Toi** pour utiliser ce projet ! 🙏

---

## 🆘 Besoin d'Aide ?

- 🐛 **Bug** : Ouvre une [issue GitHub](https://github.com/votre-username/fortress-siege/issues)
- 💡 **Question** : Vérifie [DEBUGGING.md](DEBUGGING.md)
- 💬 **Discussion** : [GitHub Discussions](https://github.com/votre-username/fortress-siege/discussions)

---

<div align="center">

## 🎉 Prêt à Jouer ?

```bash
./start.sh
```

### ⭐ N'oublie pas de star le repo ! ⭐

**Que la bataille commence ! 🏰⚔️**

</div>

## 🏗️ Architecture Technique

### Stack
- **Backend** : Node.js + Express + Socket.IO
- **Frontend** : Vanilla JavaScript + Canvas API
- **Temps réel** : WebSocket (Socket.IO)
- **État du jeu** : En mémoire (RAM)

### Structure
```
fortress-siege/
├── backend/
│   ├── server.js          # Serveur Socket.IO
│   ├── gameManager.js     # Logique du jeu
│   └── package.json
└── frontend/
    ├── index.html         # Interface
    ├── style.css          # Design
    └── game.js            # Client + Canvas
```

### Flux de Données
```
[Client] --WebSocket--> [Server] --Broadcast--> [Tous les clients]
                           |
                      [GameManager]
                      (État partagé)
```

## 🔧 Configuration

### Changer le port (backend)
Éditer `backend/server.js` :
```javascript
const PORT = process.env.PORT || 3000;
```

### Ajuster la taille de grille
Éditer `backend/gameManager.js` :
```javascript
this.GRID_SIZE = 40; // 40x40 par défaut
```

### Modifier les coûts/dégâts
Éditer `backend/gameManager.js` :
```javascript
this.WALL_COST = 10;
this.TOWER_COST = 25;
this.WALL_HP = 50;
// etc.
```

## 🚀 Déploiement Production

### Option 1 : Railway (Recommandé)
1. Créer un compte sur [Railway.app](https://railway.app)
2. Push le code sur GitHub
3. Connecter le repo à Railway
4. Déployer automatiquement

### Option 2 : Heroku
```bash
# Dans le dossier backend
heroku create fortress-siege
git push heroku main
```

### Option 3 : VPS (DigitalOcean, etc.)
```bash
# Sur le serveur
git clone [votre-repo]
cd fortress-siege/backend
npm install --production
npm install -g pm2
pm2 start server.js --name fortress-siege
pm2 save
```

### Frontend
- Héberger sur Vercel/Netlify (gratuit)
- Mettre à jour `BACKEND_URL` dans `game.js`

## 📊 Métriques & Performance

### Capacité actuelle
- **Joueurs simultanés** : ~100-200 (en mémoire)
- **Latence** : ~50-100ms
- **Bande passante** : ~1kb/s par joueur

### Optimisations futures
- [ ] Redis pour state distribué (1000+ joueurs)
- [ ] Compression WebSocket (zlib)
- [ ] Delta updates (envoyer seulement les changements)
- [ ] Interpolation côté client

## 🎨 Personnalisation

### Changer les couleurs
Éditer `frontend/game.js` :
```javascript
const COLORS = {
  fortress: '#ff6b6b',  // Rouge
  tower: '#4ecdc4',     // Cyan
  // ...
};
```

### Ajouter des sons
Remplacer la fonction `playSound()` dans `game.js` avec de vrais fichiers audio :
```javascript
const audio = new Audio('sounds/hit.mp3');
audio.play();
```

## 🐛 Debugging

### Voir les logs serveur
```bash
cd backend
npm start
# Les logs s'affichent dans la console
```

### Débugger le client
- Ouvrir DevTools (F12)
- Onglet Console pour voir les erreurs
- Onglet Network > WS pour voir les WebSocket

## 🔒 Sécurité (TODO pour production)

- [ ] Rate limiting (anti-spam)
- [ ] Validation serveur de toutes les actions
- [ ] Authentification (comptes utilisateurs)
- [ ] HTTPS obligatoire
- [ ] Sanitization des usernames

## 📝 Roadmap

### Phase 1 ✅ (MVP)
- [x] Carte mondiale unique
- [x] Défenseurs vs Attaquants
- [x] Murs et tourelles
- [x] Attaques et destruction
- [x] UI temps réel

### Phase 2 🚧 (En cours)
- [ ] Comptes utilisateurs
- [ ] Leaderboard global
- [ ] Historique des parties
- [ ] Système de progression (XP)

### Phase 3 📅 (Futur)
- [ ] Nouvelles maps (différentes forteresses)
- [ ] Power-ups temporaires
- [ ] Modes de jeu (Rush, Horde)
- [ ] Saisons & récompenses
- [ ] Version mobile native

## 🤝 Contribution

Pull requests bienvenues ! Pour les changements majeurs :
1. Fork le projet
2. Créer une branche feature
3. Commit & push
4. Ouvrir une Pull Request

## 📜 Licence

MIT - Libre d'utilisation

## 🙏 Crédits

Développé avec ❤️ en JavaScript vanilla pour démontrer la puissance du temps réel sur le web.

---

**Besoin d'aide ?** Ouvre une issue sur GitHub !

**Envie de jouer ?** Lance le serveur et partage le lien ! 🎮
