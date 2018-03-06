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

  takeDamage(amount) {

  }



  onAddToWorld(gameEngine) {
    super.onAddToWorld(gameEngine);
    // TODO Is it maybe better to not add an event handler for every object, and instead have tick() called by the game engine? (spoiler: yes it is but I'm too lazy to do it rn)
    gameEngine.on('preStep', this.tick.bind(this, gameEngine));
  }

  onRemoveFromWorld(gameEngine) {
    super.onRemoveFromWorld(gameEngine);
    gameEngine.removeListener('preStep', this.tick.bind(this, gameEngine));
  }

  tick(gameEngine) { }



  initRenderContainer(container, debugContainer) {
    super.initRenderContainer(container, debugContainer);

    if (debugContainer) {
      const debugLayer = new (require("pixi.js").Graphics)();
      debugLayer.lineStyle(1, 0x88FF88, 0.5);
      debugLayer.drawCircle(this.position.x, this.position.y, 2);
      let idText = new PIXI.Text(this.id, {fontSize: 10, fill : 0xffffff});
      idText.position.x = this.position.x + 3;
      idText.position.y = this.position.y;
      debugLayer.addChild(idText);
      if (this.hitbox) {
        let corner = this.hitbox.getUpperLeft(this.position);
        debugLayer.drawRect(corner.x, corner.y, this.hitbox.w, this.hitbox.h);
      }
      debugContainer.addChild(debugLayer);
    }
  }

}

require('../../Utils/ClassLoader').registerClass(Entity);
module.exports = Entity;
