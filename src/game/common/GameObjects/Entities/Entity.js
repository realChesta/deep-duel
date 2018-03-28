'use strict';

const RenderedObject = require('../RenderedObject');

class Entity extends RenderedObject {

  get bendingMultiple() {
    return 0.8;
  }

  constructor(gameEngine, x, y) {
    super(gameEngine);
    this.position.set(x, y);
    this.hitbox = null;
  }

  isDamageable() { return false; }
  takeDamage(amount) { }
  die() { }
  isFlying() { return false; }


  getHoldingPoints() {
    return this.hitbox
      ? [this.hitbox.getLowerLeft(this.position), this.hitbox.getLowerRight(this.position)]
      : [this.position];
  }


  onAddToWorld(gameEngine) {
    super.onAddToWorld(gameEngine);
    // TODO Is it maybe better to not add an event handler for every object, and instead have tick() called by the game engine? (spoiler: yes it is but I'm too lazy to do it rn)
    this.ddhandler_tickhandler = this.tick.bind(this, gameEngine);
    gameEngine.on('preStep', this.ddhandler_tickhandler);
  }

  onRemoveFromWorld(gameEngine) {
    super.onRemoveFromWorld(gameEngine);
    gameEngine.removeListener('preStep', this.ddhandler_tickhandler);
    this.ddhandler_tickhandler = undefined;
  }

  tick(gameEngine) {
    if (!this.isFlying()) {
      let tileMap = this.gameEngine.tileMap;
      let tw = tileMap.tileWidth;
      let th = tileMap.tileHeight;

      for (let pos of this.getHoldingPoints())
        if (tileMap.getTileAt(pos.x/tw, pos.y/th) !== 0) return;


      // not on a tile
      this.die();
    }
  }



  initRenderContainer(container, debugContainer) {
    super.initRenderContainer(container, debugContainer);

    if (debugContainer) {
      const debugLayer = new (require("pixi.js").Graphics)();
      debugLayer.lineStyle(1, 0x88FF88, 0.5);
      debugLayer.drawCircle(0, 0, 2);
      let idText = new PIXI.Text(this.id, {fontSize: 10, fill : 0xffffff});
      idText.position.x = 3;
      idText.position.y = 0;
      debugLayer.addChild(idText);
      if (this.hitbox) {
        let hb = this.hitbox;
        debugLayer.drawRect(-hb.w/2 + hb.xoff, -hb.h/2 + hb.yoff, hb.w, hb.h);
      }
      debugContainer.addChild(debugLayer);
    }
  }

}

require('../../Utils/ClassLoader').registerClass(Entity);
module.exports = Entity;
