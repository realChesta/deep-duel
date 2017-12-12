'use strict';

const Character = require('./Character');
const SpriteLoader = require('../../Utils/SpriteLoader');

class Player extends Character {

  // TODO Move rendering stuff to another class
  initRenderContainer(container) {
    const MultiSprite = require('../../../client/Rendering/MultiSprite');
    this.sprite = new MultiSprite(playerAssetsId);
    container.addChild(this.sprite);
  }

  onRenderContainerDestroy(container) {
    container.removeChild(this.sprite);
    delete this.sprite;
  }

  tickSprite() {
    if (this.sprite) {
      this.sprite.tick();
    }
  }


  // TODO Consider calling this on every step where action has changed instead of whenever an action changes
  // Currently, setting an action and setting it back in the same step will still set the sprite's animation
  // TODO Currently, this method takes action/direction names - change that
  // TODO Give a new name - this triggers when state changes, not necessarily animation (it's not even a given each Creature has an animation)
  onAnimationChange(newAction, newFacingDirection) {
    super.onAnimationChange(newAction, newFacingDirection);

    if (this.sprite !== undefined) {
      this.sprite.update(newAction, newFacingDirection);
    }
  }

}

const playerAssetsId = require('../../Utils/SpriteLoader').add('assets/playerv2/playerv2.json');

require('../../Utils/ClassLoader').registerClass(Player);
module.exports = Player;
