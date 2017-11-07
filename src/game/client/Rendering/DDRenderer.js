'use strict';

const {render: {Renderer}} = require('lance-gg');
const PIXI = require('pixi.js');
const RenderedObject = require('../../common/GameObjects/RenderedObject');

class DDRenderer extends Renderer {


  constructor(gameEngine, clientEngine, debugMode) {
    super(gameEngine, clientEngine);
    this.debugMode = debugMode || (clientEngine.debugMode ? true : false);

    // TODO When the renderer gets uninitialised/removed (especially on server UI), remove these handlers
    this.gameEngine.on('objectAdded', this.onObjectAdded.bind(this));
    this.gameEngine.on('objectDestroyed', this.onObjectDestroyed.bind(this));



    // Set-up renderer and layers
    this.entirety = new PIXI.Container();
    this.entirety.scale.set(2, 2);

    this.stage = new PIXI.Container();
    this.entirety.addChild(this.stage);

    this.debugLayer = new PIXI.Graphics();
    this.entirety.addChild(this.debugLayer);

    this.uiLayer = new PIXI.Graphics();
    this.entirety.addChild(this.uiLayer);

    this.renderer = PIXI.autoDetectRenderer(this.entirety.scale.x * this.gameEngine.settings.width, this.entirety.scale.y * this.gameEngine.settings.height);
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;




    this.renderedObjects = {};    // TODO rename to renderedObjectContainers

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

    if (this.debugMode)
      this.debugLayer.clear();
    this.uiLayer.clear();

    for (let key of Object.keys(this.renderedObjects)) {
      this.drawObject.call(this, this.gameEngine.world.objects[key]);
    }



    this.renderer.render(this.entirety);
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

    if (this.debugMode) {
      this.debugLayer.lineStyle(1, 0x88FF88, 0.5);
      this.debugLayer.fillColor = 0;
      this.debugLayer.drawCircle(object.position.x, object.position.y, 2);
    }
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
