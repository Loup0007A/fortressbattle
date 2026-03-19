// Configuration du jeu - Modifiable pour tester différents équilibrages

module.exports = {
  // Grille
  GRID_SIZE: 40,
  FORTRESS_SIZE: 4,

  // Vie
  FORTRESS_MAX_HP: 1000,
  WALL_HP: 50,
  TOWER_HP: 30,

  // Coûts (ressources)
  WALL_COST: 10,
  TOWER_COST: 25,
  ATTACK_COST: 5,
  FORTRESS_ATTACK_COST: 10,

  // Dégâts
  ATTACK_DAMAGE: 10,
  FORTRESS_DAMAGE: 5,
  TOWER_DAMAGE: 5,

  // Tourelles
  TOWER_RANGE: 3,
  TOWER_COOLDOWN: 2, // secondes

  // Ressources
  RESOURCE_REGEN: 2, // par tick
  RESOURCE_REGEN_INTERVAL: 3000, // millisecondes (3 secondes)
  MAX_RESOURCES: 100,
  STARTING_RESOURCES: 50,

  // Distances
  MAX_WALL_DISTANCE: 15, // Distance max de la forteresse
  MAX_TOWER_DISTANCE: 12,

  // Gameplay
  TOWER_UPDATE_INTERVAL: 1000, // millisecondes
  AUTO_BALANCE_TEAMS: true, // Équilibrer auto les équipes
  
  // Limites
  MAX_PLAYERS_PER_TEAM: 50, // 0 = illimité
  
  // Debug
  DEBUG_MODE: false,
  LOG_PLAYER_ACTIONS: true
};
