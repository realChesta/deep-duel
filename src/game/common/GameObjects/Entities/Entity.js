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
  }

  onAddToWorld(gameEngine) {
    super.onAddToWorld(gameEngine);
  }

  getSpeed() {
    return 1;
  }

}

module.exports = Entity;
