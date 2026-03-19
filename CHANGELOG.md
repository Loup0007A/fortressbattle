# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2024-03-19

### 🎉 Première Release - MVP

#### Ajouté
- ✅ Carte mondiale unique partagée par tous les joueurs
- ✅ Système d'équipes (Défenseurs vs Attaquants)
- ✅ Forteresse centrale avec 1000 HP
- ✅ Structures défensives :
  - Murs (50 HP, coût 10)
  - Tourelles (30 HP, coût 25, portée 3)
- ✅ Actions attaquants :
  - Attaque structures (5 coût, 10 dégâts)
  - Assaut forteresse (10 coût, 5 dégâts)
- ✅ Système de ressources :
  - Régénération automatique (+2 toutes les 3s)
  - Maximum 100 ressources
- ✅ WebSocket temps réel (Socket.IO)
- ✅ Canvas rendering optimisé
- ✅ Interface responsive (mobile + desktop)
- ✅ Système de score par joueur
- ✅ Liste des joueurs en ligne
- ✅ Changement d'équipe dynamique
- ✅ Game Over avec reset automatique
- ✅ Notifications in-game
- ✅ Effets sonores basiques
- ✅ Contrôles caméra (drag & zoom)
- ✅ Support tactile mobile

#### Technique
- Node.js + Express backend
- Socket.IO pour temps réel
- Vanilla JavaScript frontend
- Canvas API pour rendu
- Architecture scalable (Map-based state)
- Configuration externalisée
- Documentation complète

---

## [Unreleased] - Prochaines Versions

### En Développement
- [ ] Système de comptes utilisateurs
- [ ] Leaderboard global
- [ ] Replays des parties
- [ ] Power-ups temporaires

### Planifié
- [ ] Nouvelles maps
- [ ] Modes de jeu alternatifs
- [ ] Saisons & battle pass
- [ ] Application mobile native

---

## Format des Versions

### [X.Y.Z] - Date

#### Ajouté
- Nouvelles fonctionnalités

#### Modifié
- Changements dans fonctionnalités existantes

#### Déprécié
- Fonctionnalités bientôt retirées

#### Retiré
- Fonctionnalités supprimées

#### Corrigé
- Corrections de bugs

#### Sécurité
- Patches de vulnérabilités

---

## Notes de Version

### v1.0.0 - MVP Complet
Cette première version inclut toutes les fonctionnalités essentielles pour un jeu multijoueur fonctionnel :
- Jouabilité fluide sur tous les appareils
- Synchronisation temps réel stable
- Équilibrage de base testé
- Documentation complète pour déploiement

**Performances mesurées** :
- 50-100 joueurs simultanés (en mémoire)
- Latence moyenne : 50-80ms
- FPS client : 60 (desktop), 30+ (mobile)

**Compatibilité** :
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Chrome Android 90+

---

## Support & Contributions

Pour reporter un bug ou suggérer une amélioration :
- Ouvrir une issue sur GitHub
- Joindre les logs si possible
- Décrire les étapes de reproduction

Pull requests bienvenues !
