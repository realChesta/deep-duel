'use strict';

const RenderedObject = require('../RenderedObject');

class Entity extends RenderedObject {

  get bendingMultiple() {
    return 0.8;
  }

  constructor(id, x, y) {
    super(id);
    this.position.set(x, y);
    this.class = Entity;
  }

  onAddToWorld(gameEngine) {
    super.onAddToWorld();
  }

  getSpeed() {
    return 4;
  }

  initRenderContainer(container) {
    const PIXI = require('pixi.js');
    this.graphics = new PIXI.Graphics();
    container.addChild(this.graphics);
  }

  onRenderContainerDestroy(container) {
    // We don't necessarily need to clean-up here, but it's good practice to still do
    container.removeChild(this.graphics);
    delete this.graphics;
  }

  drawSprite(container) {
    this.graphics.clear();
    this.graphics.beginFill(0x8888FF);
    this.graphics.drawCircle(0, 0, 12);
    this.graphics.endFill();
  }

}

module.exports = Entity;
