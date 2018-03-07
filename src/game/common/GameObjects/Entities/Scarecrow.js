'use strict';

const Creature = require('./Creature');
const CreatureAction = require('./CreatureStates/CreatureAction');
const Hitbox = require('../../Physics/Collision/Hitbox');

class Scarecrow extends Creature {

  constructor(gameEngine, x, y) {
    super(gameEngine, x, y);
    this.hitbox = new Hitbox(26, 52);

    if (gameEngine !== null)
      this.state.setMainActionType(Scarecrow.ActionTypes.Regenerating);
  }


  getDefaultMaxHealth() {
    return 5;
  }


  initRenderContainer(container, debugContainer) {
    super.initRenderContainer(container, debugContainer);

    const PIXI = require('pixi.js');
    this.graphics = new PIXI.Graphics();
    container.addChild(this.graphics);
  }

  onRenderContainerDestroy(container, debugContainer) {
    super.onRenderContainerDestroy(container, debugContainer);

    container.removeChild(this.graphics);
    delete this.graphics;
  }

  drawSprite(container, debugContainer) {
    super.drawSprite(container, debugContainer);
    if (this.graphics != null) {
      let color = 0x010100;

      if (this.state.getMainActionType() === Scarecrow.ActionTypes.Regenerating) {
        color = 0x000001;
      } else if (this.state.getMainActionType() === Scarecrow.ActionTypes.Hurt) {
        color = 0x010000;
      }
      color *= Math.round(255 * this.health / this.maxHealth);

      this.graphics.clear();

      let hb = this.hitbox;
      this.graphics.beginFill(color);
      this.graphics.drawRect(hb.xoff - hb.w/2, hb.yoff - hb.h/2, hb.w, hb.h);
      this.graphics.endFill();
    }
  }

  takeDamage(damage) {
    super.takeDamage(damage);
    this.state.setMainActionType(Scarecrow.ActionTypes.Hurt);
  }

}

Scarecrow.ActionTypes = {
  Regenerating: new CreatureAction.Type(Scarecrow, 'regenerating')
      .setLockDuration(0)
      .setActionLength(600)
      .onStart(function() { this.gameObject.state.healthResources.increase(1); }),
  // TODO Might wanna move Hurt to Creature. Also might wanna make it a non-main action instead
  Hurt: new CreatureAction.Type(Scarecrow, 'hurt')
      .setLockDuration(10)
      .setActionLength(80)

};

Scarecrow.ActionTypes.Regenerating.setNextAction(Scarecrow.ActionTypes.Regenerating);
Scarecrow.ActionTypes.Hurt.setNextAction(Scarecrow.ActionTypes.Regenerating);

require('../../Utils/ClassLoader').registerClass(Scarecrow);
module.exports = Scarecrow;
