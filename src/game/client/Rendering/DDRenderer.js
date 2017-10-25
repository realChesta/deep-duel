'use strict';

const {render: {Renderer}} = require('lance-gg');
const PIXI = require('pixi.js');

class DDRenderer extends Renderer {


  constructor(gameEngine, clientEngine) {
    super(gameEngine, clientEngine);

    this.stage = new PIXI.Container();
    this.stage.scale.set(4, 4);
    this.renderer = PIXI.autoDetectRenderer(this.stage.scale.x * this.gameEngine.settings.width, this.stage.scale.y * this.gameEngine.settings.height);
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    this.renderedObjects = {};
  }


  getView() {
    return this.renderer.view;
  }


  draw() {
    super.draw();

    Object.keys(this.renderedObjects).forEach(
      (key) => this.drawObject.call(this, this.gameEngine.world.objects[key])
    );

    this.renderer.render(this.stage);
  }

  drawObject(object) {
    var container = this.renderedObjects[object.id];
    container.x = object.position.x;
    container.y = object.position.y;
    object.drawSprite(container);
  }

  addRenderedObject(object) {
    if (this.renderedObjects[object.id]) {
      this.removeRenderedObject(object);
    }

    var container = new PIXI.Container();
    this.stage.addChild(container);
    object.initRenderContainer(container);
    this.renderedObjects[object.id] = container;
  }

  removeRenderedObject(object) {
    var container = this.renderedObjects[object.id];
    if (!container) {
      console.error("Tried to remove a RenderedObject that isn't in the pool!");
      return;
    }
    delete this.renderedObjects[object.id];
    object.onRenderContainerDestroy(container);
    this.stage.removeChild(container);
  }

}


module.exports = DDRenderer;
