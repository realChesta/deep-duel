'use strict';

const Character = require('./Character');
const SpriteLoader = require('../../Utils/SpriteLoader');

class Player extends Character {

  // TODO Move rendering stuff to another class
  initRenderContainer(container, debugContainer) {
    super.initRenderContainer(container, debugContainer);

    const MultiSprite = require('../../../client/Rendering/MultiSprite');
    this.sprite = new MultiSprite(playerAssetsId);
    container.addChild(this.sprite);
  }

  onRenderContainerDestroy(container, debugContainer) {
    super.onRenderContainerDestroy(container, debugContainer);

    container.removeChild(this.sprite);
    delete this.sprite;
  }

  tickSprite(gameEngine) {
    super.tickSprite(gameEngine);

    if (this.sprite) {
      this.sprite.update(this.state);
      this.sprite.tick(this.gameEngine.world.stepCount);
    }
  }

}

const playerAssetsId = require('../../Utils/SpriteLoader').add('assets/playerv2/playerv2.json');

require('../../Utils/ClassLoader').registerClass(Player);
module.exports = Player;
