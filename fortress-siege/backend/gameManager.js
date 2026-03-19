const config = require('./config');

class GameManager {
  constructor(io) {
    this.io = io;
    this.GRID_SIZE = config.GRID_SIZE;
    this.FORTRESS_SIZE = config.FORTRESS_SIZE;
    
    // État du jeu mondial
    this.state = {
      fortress: {
        x: Math.floor(this.GRID_SIZE / 2) - 2,
        y: Math.floor(this.GRID_SIZE / 2) - 2,
        hp: config.FORTRESS_MAX_HP,
        maxHp: config.FORTRESS_MAX_HP
      },
      walls: new Map(), // key: "x,y", value: {x, y, hp, maxHp, placedBy}
      towers: new Map(), // key: "x,y", value: {x, y, hp, maxHp, cooldown, range, placedBy}
    };

    // Joueurs connectés
    this.players = new Map(); // key: socketId, value: {id, username, team, resources, score}
    
    // Constantes (importées depuis config)
    this.WALL_COST = config.WALL_COST;
    this.TOWER_COST = config.TOWER_COST;
    this.WALL_HP = config.WALL_HP;
    this.TOWER_HP = config.TOWER_HP;
    this.TOWER_RANGE = config.TOWER_RANGE;
    this.TOWER_DAMAGE = config.TOWER_DAMAGE;
    this.ATTACK_DAMAGE = config.ATTACK_DAMAGE;
    this.FORTRESS_DAMAGE = config.FORTRESS_DAMAGE;
    this.RESOURCE_REGEN = config.RESOURCE_REGEN;
    this.MAX_RESOURCES = config.MAX_RESOURCES;
  }

  // Récupérer l'état complet du jeu
  getState() {
    return {
      fortress: this.state.fortress,
      walls: Array.from(this.state.walls.values()),
      towers: Array.from(this.state.towers.values()),
      gridSize: this.GRID_SIZE
    };
  }

  // Récupérer la liste des joueurs
  getPlayerList() {
    return Array.from(this.players.values()).map(p => ({
      id: p.id,
      username: p.username,
      team: p.team,
      resources: p.resources,
      score: p.score
    }));
  }

  // Ajouter un joueur
  addPlayer(socketId, username) {
    // Équilibrer les équipes
    const defenderCount = Array.from(this.players.values()).filter(p => p.team === 'defender').length;
    const attackerCount = Array.from(this.players.values()).filter(p => p.team === 'attacker').length;
    const team = defenderCount <= attackerCount ? 'defender' : 'attacker';

    this.players.set(socketId, {
      id: socketId,
      username: username || `Player${Math.floor(Math.random() * 1000)}`,
      team: team,
      resources: 50, // Ressources de départ
      score: 0
    });
  }

  // Retirer un joueur
  removePlayer(socketId) {
    this.players.delete(socketId);
  }

  // Changer d'équipe
  switchTeam(socketId) {
    const player = this.players.get(socketId);
    if (!player) return { success: false };

    player.team = player.team === 'defender' ? 'attacker' : 'defender';
    player.resources = 50; // Réinitialiser les ressources
    
    return { 
      success: true, 
      data: { team: player.team }
    };
  }

  // Vérifier si une position est valide
  isValidPosition(x, y) {
    if (x < 0 || x >= this.GRID_SIZE || y < 0 || y >= this.GRID_SIZE) {
      return false;
    }

    // Vérifier si c'est dans la forteresse
    if (this.isInFortress(x, y)) {
      return false;
    }

    return true;
  }

  isInFortress(x, y) {
    const fx = this.state.fortress.x;
    const fy = this.state.fortress.y;
    return x >= fx && x < fx + this.FORTRESS_SIZE && 
           y >= fy && y < fy + this.FORTRESS_SIZE;
  }

  // Placer un mur (défenseurs uniquement)
  placeWall(socketId, x, y) {
    const player = this.players.get(socketId);
    if (!player || player.team !== 'defender') {
      return { success: false, error: 'Only defenders can place walls' };
    }

    if (player.resources < this.WALL_COST) {
      return { success: false, error: 'Not enough resources' };
    }

    if (!this.isValidPosition(x, y)) {
      return { success: false, error: 'Invalid position' };
    }

    const key = `${x},${y}`;
    if (this.state.walls.has(key) || this.state.towers.has(key)) {
      return { success: false, error: 'Position occupied' };
    }

    // Vérifier distance de la forteresse (max 10 cases)
    const fx = this.state.fortress.x + this.FORTRESS_SIZE / 2;
    const fy = this.state.fortress.y + this.FORTRESS_SIZE / 2;
    const distance = Math.sqrt(Math.pow(x - fx, 2) + Math.pow(y - fy, 2));
    if (distance > 15) {
      return { success: false, error: 'Too far from fortress' };
    }

    player.resources -= this.WALL_COST;
    player.score += 5;

    this.state.walls.set(key, {
      x,
      y,
      hp: this.WALL_HP,
      maxHp: this.WALL_HP,
      placedBy: player.username
    });

    return {
      success: true,
      data: { x, y, hp: this.WALL_HP, placedBy: player.username }
    };
  }

  // Placer une tourelle (défenseurs uniquement)
  placeTower(socketId, x, y) {
    const player = this.players.get(socketId);
    if (!player || player.team !== 'defender') {
      return { success: false, error: 'Only defenders can place towers' };
    }

    if (player.resources < this.TOWER_COST) {
      return { success: false, error: 'Not enough resources' };
    }

    if (!this.isValidPosition(x, y)) {
      return { success: false, error: 'Invalid position' };
    }

    const key = `${x},${y}`;
    if (this.state.walls.has(key) || this.state.towers.has(key)) {
      return { success: false, error: 'Position occupied' };
    }

    // Vérifier distance de la forteresse
    const fx = this.state.fortress.x + this.FORTRESS_SIZE / 2;
    const fy = this.state.fortress.y + this.FORTRESS_SIZE / 2;
    const distance = Math.sqrt(Math.pow(x - fx, 2) + Math.pow(y - fy, 2));
    if (distance > 12) {
      return { success: false, error: 'Too far from fortress' };
    }

    player.resources -= this.TOWER_COST;
    player.score += 10;

    this.state.towers.set(key, {
      x,
      y,
      hp: this.TOWER_HP,
      maxHp: this.TOWER_HP,
      cooldown: 0,
      range: this.TOWER_RANGE,
      placedBy: player.username
    });

    return {
      success: true,
      data: { x, y, hp: this.TOWER_HP, range: this.TOWER_RANGE, placedBy: player.username }
    };
  }

  // Attaquer une structure (attaquants uniquement)
  attackStructure(socketId, x, y) {
    const player = this.players.get(socketId);
    if (!player || player.team !== 'attacker') {
      return { success: false, error: 'Only attackers can attack structures' };
    }

    if (player.resources < 5) {
      return { success: false, error: 'Not enough resources' };
    }

    const key = `${x},${y}`;
    let structure = this.state.walls.get(key);
    let type = 'wall';
    
    if (!structure) {
      structure = this.state.towers.get(key);
      type = 'tower';
    }

    if (!structure) {
      return { success: false, error: 'No structure at this position' };
    }

    player.resources -= 5;
    structure.hp -= this.ATTACK_DAMAGE;

    let destroyed = false;
    if (structure.hp <= 0) {
      if (type === 'wall') {
        this.state.walls.delete(key);
      } else {
        this.state.towers.delete(key);
      }
      destroyed = true;
      player.score += type === 'wall' ? 10 : 20;
    }

    return {
      success: true,
      data: {
        x,
        y,
        hp: Math.max(0, structure.hp),
        type,
        destroyed
      }
    };
  }

  // Attaquer la forteresse (attaquants uniquement, doivent être adjacents)
  attackFortress(socketId) {
    const player = this.players.get(socketId);
    if (!player || player.team !== 'attacker') {
      return { success: false, error: 'Only attackers can attack fortress' };
    }

    if (player.resources < 10) {
      return { success: false, error: 'Not enough resources' };
    }

    player.resources -= 10;
    this.state.fortress.hp -= this.FORTRESS_DAMAGE;
    player.score += 5;

    let destroyed = false;
    if (this.state.fortress.hp <= 0) {
      this.state.fortress.hp = 0;
      destroyed = true;
    }

    return {
      success: true,
      data: {
        hp: this.state.fortress.hp,
        maxHp: this.state.fortress.maxHp,
        destroyed
      }
    };
  }

  // Les tourelles attaquent automatiquement (cherchent joueurs à portée)
  processTowers() {
    const attacks = [];
    
    for (const tower of this.state.towers.values()) {
      if (tower.cooldown > 0) {
        tower.cooldown--;
        continue;
      }

      // Pour simplifier, les tourelles infligent des dégâts aléatoires aux attaquants
      // Dans une vraie version, on trackait les positions des joueurs
      const attackerCount = Array.from(this.players.values())
        .filter(p => p.team === 'attacker').length;

      if (attackerCount > 0) {
        tower.cooldown = 2; // Tire toutes les 2 secondes
        attacks.push({
          x: tower.x,
          y: tower.y,
          damage: this.TOWER_DAMAGE
        });
      }
    }

    return attacks;
  }

  // Régénérer les ressources
  regenerateResources() {
    for (const player of this.players.values()) {
      player.resources = Math.min(
        this.MAX_RESOURCES,
        player.resources + this.RESOURCE_REGEN
      );
    }
  }

  // Réinitialiser le jeu
  resetGame() {
    this.state.fortress.hp = this.state.fortress.maxHp;
    this.state.walls.clear();
    this.state.towers.clear();

    // Réinitialiser les scores mais garder les joueurs
    for (const player of this.players.values()) {
      player.resources = 50;
      player.score = 0;
    }
  }
}

module.exports = GameManager;
