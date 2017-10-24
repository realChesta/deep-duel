'use strict'

const Entity = require('./Entity');

class Creature extends Entity {
  constructor(id, x, y) {
    super(id, x, y);
  }

  //I don't really know what else to put here
}

Creature.ActionType = {
  Idle: 'idle',
  Running: 'running',
  Melee: 'melee',
  Shooting: 'shooting'
};

module.exports = Creature;
