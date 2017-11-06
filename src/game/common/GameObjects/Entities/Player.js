'use strict';

const Character = require('./Character');
const SpriteLoader = require('../../Utils/SpriteLoader');

class Player extends Character {

  initRenderContainer(container) {
    const MultiSprite = require('../../../client/Rendering/MultiSprite');
    this.sprite = new MultiSprite(playerAssetsId);
    container.addChild(this.sprite);
  }

  onRenderContainerDestroy(container) {
    container.removeChild(this.sprite);
    delete this.sprite;
  }

  onAnimationChange(newAction, newDirection) {
    super.onAnimationChange(newAction, newDirection);

    if (this.sprite !== undefined) {
      this.sprite.update(newAction, newDirection);
    }
  }

}

const playerAssetsId = require('../../Utils/SpriteLoader').add('assets/playerv2/playerv2.json');

require('../../Utils/ClassLoader').registerClass(Player);
module.exports = Player;
