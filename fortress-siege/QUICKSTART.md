# ⚡ Démarrage Rapide - 3 Minutes

## 🎯 Option 1 : Ultra Rapide (1 commande)

```bash
cd fortress-siege && ./start.sh
```

Puis ouvre : **http://localhost:3000**

---

## 🎯 Option 2 : Étape par étape

### 1️⃣ Installation (30 secondes)

```bash
cd fortress-siege/backend
npm install
```

### 2️⃣ Démarrage (5 secondes)

```bash
npm start
```

Tu devrais voir :
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏰 FORTRESS SIEGE - Serveur Démarré
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 URL locale :  http://localhost:3000
```

### 3️⃣ Jouer (Maintenant!)

Ouvre ton navigateur : **http://localhost:3000**

---

## 🎮 Premiers Pas

### 1. Connexion
```
┌─────────────────────────────┐
│  🏰 FORTRESS SIEGE          │
│                             │
│  [Ton pseudo ici___]        │
│                             │
│  [REJOINDRE LA BATAILLE]    │
└─────────────────────────────┘
```

### 2. Choisir ton camp

Tu es automatiquement assigné à une équipe :

**🛡️ DÉFENSEUR**
- Protège la forteresse (centre)
- Place murs (10💰) et tourelles (25💰)
- Stratégie : Cercles de défense

**⚔️ ATTAQUANT**
- Détruis la forteresse !
- Attaque structures (5💰)
- Assaut forteresse (10💰)

### 3. Actions

```
Défenseurs :
┌──────┐  ┌──────┐
│ 🧱   │  │ 🗼   │
│ Mur  │  │Tower │
│ 10💰 │  │ 25💰 │
└──────┘  └──────┘

Attaquants :
┌──────┐  ┌──────┐
│ ⚔️   │  │ 💥   │
│Attack│  │Siege │
│ 5💰  │  │ 10💰 │
└──────┘  └──────┘
```

### 4. Interface

```
┌─────────────────────────────────────────┐
│ 🛡️ Défenseur  [🔄 Changer]   🏰 1000/1000│
│                                  💰 50   │
├─────────────────────────────────────────┤
│                                         │
│         [CARTE DE JEU]                  │
│                                         │
│    Clique pour placer/attaquer         │
│    Drag pour bouger la caméra          │
│                                         │
├─────────────────────────────────────────┤
│ Joueurs (5):                            │
│  • Player1 💰50 ⭐10                     │
│  • Player2 💰30 ⭐5                      │
└─────────────────────────────────────────┘
```

---

## 💡 Tips & Astuces

### Défenseurs
✅ **Murs en cercles** autour de la forteresse
✅ **Tourelles derrière** les murs (protégées)
✅ **Espacement** : Évite les gros trous
❌ Ne gaspille pas tout sur les murs
❌ Trop loin = inutile

### Attaquants
✅ **Groupe** : Attaquez ensemble !
✅ **Priorités** : Tourelles d'abord, murs ensuite
✅ **Patience** : Accumule 50+ ressources avant rush
❌ Ne t'éparpille pas
❌ N'attaque pas seul si défense forte

### Général
💰 **Ressources** : +2 toutes les 3 secondes (max 100)
🔄 **Change d'équipe** si déséquilibre
🗣️ **Coordonne** avec ton équipe (bientôt chat)

---

## 🐛 Problèmes Courants

### "Cannot find module 'express'"
```bash
cd backend
npm install
```

### "Port 3000 already in use"
Option A : Tuer le process :
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

Option B : Changer le port dans `backend/server.js` :
```javascript
const PORT = 3001; // Au lieu de 3000
```

### "Canvas is blank"
- Refresh la page (Ctrl+R)
- Vide le cache (Ctrl+Shift+R)
- Vérifie la console (F12) pour erreurs

### "Déconnecté du serveur"
- Vérifie que le backend tourne
- Regarde les logs serveur
- Problème firewall ? (rare en local)

---

## 📱 Jouer avec des amis

### Sur le même réseau (WiFi)

1. **Trouve ton IP locale** :
```bash
# Linux/Mac
ifconfig | grep "inet "

# Windows
ipconfig
```

Tu cherches quelque chose comme `192.168.1.X`

2. **Partage l'URL** :
```
http://192.168.1.X:3000
```

### Sur Internet (avec Ngrok)

```bash
# Installe ngrok
npm install -g ngrok

# Lance ngrok
ngrok http 3000
```

Tu reçois une URL publique :
```
https://abc123.ngrok.io
```

Partage cette URL ! ⚡

---

## 🎨 Personnaliser

### Changer les couleurs
`frontend/game.js` ligne 5 :
```javascript
const COLORS = {
  fortress: '#ff6b6b',  // Rouge → Change ici
  tower: '#4ecdc4',     // Cyan → Change ici
  // ...
};
```

### Ajuster la difficulté
`backend/config.js` :
```javascript
WALL_HP: 50,          // Vie des murs
TOWER_DAMAGE: 5,      // Dégâts tourelles
RESOURCE_REGEN: 2,    // Vitesse ressources
// ...
```

### Taille de carte
`backend/config.js` :
```javascript
GRID_SIZE: 40,  // 40x40 → Change à 50 pour plus grand
```

---

## 📚 Ressources

- 📖 **README.md** : Documentation complète
- 🚀 **DEPLOYMENT.md** : Guide déploiement
- 🗺️ **ROADMAP.md** : Fonctionnalités futures
- 🧪 **TESTING.md** : Guide de tests

---

## 🆘 Besoin d'aide ?

1. **Lis la FAQ** dans README.md
2. **Vérifie les issues** GitHub
3. **Ouvre une issue** avec :
   - Ton OS
   - Version Node.js
   - Logs d'erreur
   - Étapes de reproduction

---

## 🎉 C'est parti !

```bash
cd fortress-siege
./start.sh
```

**Enjoy ! 🏰⚔️**
