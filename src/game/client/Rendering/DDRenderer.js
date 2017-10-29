'use strict';

const {render: {Renderer}} = require('lance-gg');
const PIXI = require('pixi.js');
const RenderedObject = require('../../common/GameObjects/RenderedObject');

class DDRenderer extends Renderer {


  constructor(gameEngine, clientEngine) {
    super(gameEngine, clientEngine);

    // TODO When the renderer gets uninitialised/removed (especially on server UI), remove these handlers
    this.gameEngine.on('objectAdded', this.onObjectAdded.bind(this));
    this.gameEngine.on('objectDestroyed', this.onObjectDestroyed.bind(this));


    this.stage = new PIXI.Container();
    this.stage.scale.set(2, 2);
    this.renderer = PIXI.autoDetectRenderer(this.stage.scale.x * this.gameEngine.settings.width, this.stage.scale.y * this.gameEngine.settings.height);
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    this.renderedObjects = {};    // TODO rename to renderedObjectsContainer

    if (!this.clientEngine) {
      let trenderer = this;
      let renderLoop = (function() {
        trenderer.draw();
        window.requestAnimationFrame(renderLoop);
      }).bind(true);
      this.init().then(() => window.requestAnimationFrame(renderLoop));
    }
  }


  getView() {
    return this.renderer.view;
  }


  draw() {
    if (this.clientEngine)
      super.draw();

    for (let key of Object.keys(this.renderedObjects)) {
      this.drawObject.call(this, this.gameEngine.world.objects[key]);
    }

    this.renderer.render(this.stage);
  }

  runClientStep() {
    if (this.clientEngine)
      super.runClientStep();
  }

  drawObject(object) {
    var container = this.renderedObjects[object.id];
    container.x = object.position.x;
    container.y = object.position.y;
    object.drawSprite(container);
  }

  onObjectAdded(object) {
    if (object instanceof RenderedObject)
      this.addRenderedObject(object);
  }

  onObjectDestroyed(object) {
    if (object instanceof RenderedObject)
      this.removeRenderedObject(object);
  }

  addRenderedObject(object) {
    console.log(object);
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
