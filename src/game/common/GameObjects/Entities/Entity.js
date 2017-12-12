'use strict';

const RenderedObject = require('../RenderedObject');

class Entity extends RenderedObject {

  get bendingMultiple() {
    return 0.8;
  }

  constructor(id, x, y) {
    super(id);
    this.position.set(x, y);
    this.hitbox = null;
  }

  takeDamage(amount) {

  }


  drawSprite(container, debugLayer) {
    super.drawSprite(container, debugLayer);

    if (debugLayer) {
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
    }
  }

}

require('../../Utils/ClassLoader').registerClass(Entity);
module.exports = Entity;
