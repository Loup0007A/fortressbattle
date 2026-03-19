# Tests Fortress Siege

## Tests Manuels

### 1. Connexion
- [ ] Ouvrir `http://localhost:3000`
- [ ] Entrer un pseudo
- [ ] Cliquer "Rejoindre la bataille"
- [ ] Vérifier l'affichage de la carte

### 2. Équipes
- [ ] Vérifier l'attribution d'équipe (Défenseur ou Attaquant)
- [ ] Cliquer "Changer d'équipe"
- [ ] Vérifier le changement d'équipe
- [ ] Vérifier que les actions changent selon l'équipe

### 3. Défenseurs
- [ ] Sélectionner "Mur"
- [ ] Cliquer sur la carte
- [ ] Vérifier l'apparition du mur
- [ ] Vérifier la déduction de ressources (-10)
- [ ] Sélectionner "Tourelle"
- [ ] Cliquer sur la carte
- [ ] Vérifier l'apparition de la tourelle
- [ ] Vérifier la déduction de ressources (-25)

### 4. Attaquants
- [ ] Changer en Attaquant
- [ ] Sélectionner "Attaquer"
- [ ] Cliquer sur un mur/tourelle
- [ ] Vérifier la réduction de HP
- [ ] Attaquer jusqu'à destruction
- [ ] Vérifier la disparition de la structure
- [ ] Sélectionner "Assaut Forteresse"
- [ ] Cliquer n'importe où
- [ ] Vérifier la réduction HP forteresse

### 5. Ressources
- [ ] Attendre 3 secondes
- [ ] Vérifier +2 ressources
- [ ] Vérifier le plafond à 100

### 6. Multi-joueurs
- [ ] Ouvrir un 2ème onglet (mode incognito)
- [ ] Se connecter avec un autre pseudo
- [ ] Sur onglet 1 : placer un mur
- [ ] Sur onglet 2 : vérifier l'apparition immédiate
- [ ] Sur onglet 2 : attaquer le mur
- [ ] Sur onglet 1 : vérifier la réduction de HP

### 7. Game Over
- [ ] Attaquer la forteresse jusqu'à 0 HP
- [ ] Vérifier l'affichage du modal "Victoire Attaquants"
- [ ] Attendre 5 secondes
- [ ] Vérifier le reset du jeu

### 8. Mobile (Responsive)
- [ ] Ouvrir DevTools (F12)
- [ ] Activer mode mobile (Ctrl+Shift+M)
- [ ] Vérifier l'interface responsive
- [ ] Tester le drag de la carte
- [ ] Tester les boutons d'action

### 9. Performance
- [ ] Ouvrir l'onglet Performance DevTools
- [ ] Jouer pendant 1 minute
- [ ] Vérifier FPS > 30
- [ ] Vérifier mémoire stable (pas de fuite)

## Tests Automatisés (TODO)

```javascript
// Test de connexion
describe('Socket Connection', () => {
  it('should connect to server', (done) => {
    const socket = io('http://localhost:3000');
    socket.on('connect', () => {
      expect(socket.connected).toBe(true);
      done();
    });
  });
});

// Test placement mur
describe('Wall Placement', () => {
  it('should place wall when defender', (done) => {
    // Mock defender player
    // Emit placeWall
    // Expect wallPlaced event
  });
});
```

## Tests de Charge

### Avec k6 (Load Testing)

```javascript
// loadtest.js
import ws from 'k6/ws';
import { check } from 'k6';

export let options = {
  vus: 100, // 100 utilisateurs virtuels
  duration: '30s',
};

export default function () {
  const url = 'ws://localhost:3000';
  const res = ws.connect(url, function (socket) {
    socket.on('open', () => {
      socket.send(JSON.stringify({ 
        type: 'joinGame', 
        username: 'TestUser' + __VU 
      }));
    });

    socket.on('message', (data) => {
      console.log('Message received:', data);
    });

    socket.setTimeout(function () {
      socket.close();
    }, 10000);
  });

  check(res, { 'status is 101': (r) => r && r.status === 101 });
}
```

Run : `k6 run loadtest.js`

## Métriques à Surveiller

### Serveur
- CPU usage < 80%
- RAM usage < 500MB (pour 100 joueurs)
- Network I/O < 1MB/s

### Client
- FPS > 30
- Memory < 150MB
- Latency < 100ms

## Checklist Pre-Release

- [ ] Tous les tests manuels passent
- [ ] Pas d'erreurs console
- [ ] Temps de chargement < 3s
- [ ] Fonctionne sur Chrome, Firefox, Safari
- [ ] Fonctionne sur mobile (iOS, Android)
- [ ] WebSocket reconnexion automatique
- [ ] Pas de fuite mémoire après 10min de jeu
- [ ] Rate limiting testé (spam actions)
- [ ] Multi-onglets synchronisés
- [ ] Gestion déconnexion propre
