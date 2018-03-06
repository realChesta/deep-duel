'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';

class DDGameObject extends DynamicObject {

  constructor(gameEngine) {
    super(gameEngine);
  }

  onAddToWorld(gameEngine) {
    super.onAddToWorld(gameEngine);
    this.gameEngine = gameEngine;
  }

}

// TODO Do we need ClassLoader here?
module.exports = DDGameObject;
