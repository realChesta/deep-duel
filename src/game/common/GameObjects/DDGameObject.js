'use strict';

const {serialize: {DynamicObject}} = require('lance-gg');

class DDGameObject extends DynamicObject {

  constructor(id) {
    super(id);
  }

  onAddToWorld(gameEngine) {
    super.onAddToWorld(gameEngine);
    this.gameEngine = gameEngine;
  }

}

// TODO Do we need ClassLoader here?
module.exports = DDGameObject;
