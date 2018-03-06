'use strict';

const Entity = require('./Entity');


class Projectile extends Entity {

  constructor(gameEngine, x, y, projectileDamage) {
    super(gameEngine, x, y);
    this.projectileDamage = projectileDamage;
  }

  tick(gameEngine) {
    // TODO Move to its own class

  }

}
