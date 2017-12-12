'use strict';

const Creature = require('./Creature');
const CreatureAction = require('./CreatureStates/CreatureAction');
const Hitbox = require('../../Physics/Collision/Hitbox');

class Scarecrow extends Creature {

  constructor(id, x, y) {
    super(id, x, y);
    this.hitbox = new Hitbox(26, 52);
  }


  initRenderContainer(container) {
    const PIXI = require('pixi.js');
    this.graphics = new PIXI.Graphics();
    container.addChild(this.graphics);
    this.onAnimationChange(this.state.mainAction.type.name, this.facingDirection.name);
  }

  onRenderContainerDestroy(container) {
    container.removeChild(this.graphics);
    delete this.graphics;
  }

  // TODO change this with Player.onAnimationChange()
  onAnimationChange(newAction, newFacingDirection) {
    if (this.graphics != null) {
      let color = 0xFFFF00;

      if (newAction === 'idle') {
        color = 0x0000FF;
      } else if (newAction === 'hurt') {
        color = 0xFF0000;
      }


      this.graphics.clear();

      let hb = this.hitbox;
      this.graphics.beginFill(color);
      this.graphics.drawRect(hb.xoff - hb.w/2, hb.yoff - hb.h/2, hb.w, hb.h);
      this.graphics.endFill();
    }
  }

  takeDamage() {
    if (this.state.setMainActionType(Scarecrow.ActionTypes.Hurt)) {
      super.takeDamage();
    }
  }

}

Scarecrow.ActionTypes = {
  Idle: CreatureAction.Type.Idle,
  // TODO Might wanna move Hurt to Creature. Also might wanna make it a non-main action instead
  Hurt: new CreatureAction.Type(Scarecrow, 'hurt')
      .setLockDuration(10)
      .setActionLength(80)

};

require('../../Utils/ClassLoader').registerClass(Scarecrow);
module.exports = Scarecrow;
