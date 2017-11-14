'use strict';

const RenderedObject = require('../RenderedObject');

class Entity extends RenderedObject {

  get bendingMultiple() {
    return 0.8;
  }

  constructor(id, x, y) {
    super(id);
    this.position.set(x, y);
    this.class = Entity;
    this.hitbox = null;
  }

  onAddToWorld(gameEngine) {
    super.onAddToWorld(gameEngine);
  }

  getSpeed() {
    return 2;
  }

  takeDamage(amount) {
    console.log("Damage was taken!", amount, this);
  }

}

require('../../Utils/ClassLoader').registerClass(Entity);
module.exports = Entity;
