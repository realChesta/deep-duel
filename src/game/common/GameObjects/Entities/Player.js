'use strict';

const Character = require('./Character');
const SpriteLoader = require('../../Utils/SpriteLoader');

class Player extends Character {


  initRenderContainer(container) {
    const MultiSprite = require('../../../client/Rendering/MultiSprite');
    this.sprite = new MultiSprite('playerAssets');
    container.addChild(this.sprite);
  }

  onRenderContainerDestroy(container) {
    container.removeChild(this.sprite);
    delete this.sprite;
  }

  onActionChange(oldAction, newAction) {
    super.onActionChange();

    if (this.sprite !== undefined)
      this.sprite.setAction(newAction);
  }

  onDirectionChange(oldDirection, newDirection) {
    super.onDirectionChange();

    if (this.sprite !== undefined)
      this.sprite.setDirection(newDirection);
  }

}

require('../../Utils/SpriteLoader').add('playerAssets', 'assets/player/player.json');

module.exports = Player;
