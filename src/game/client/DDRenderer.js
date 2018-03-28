'use strict';

import Renderer from 'lance/render/Renderer';
import RenderedObject from 'game/common/GameObjects/RenderedObject';

class DDRenderer extends Renderer {

  constructor(gameEngine, clientEngine, debugMode) {
    super(gameEngine, clientEngine);
    this.debugMode = debugMode || (clientEngine && clientEngine.options.debugMode === 'true');


    if (!this.clientEngine) {
      let renderLoop = (function() {
        this.draw();
        window.requestAnimationFrame(renderLoop);
      }).bind(this);
      this.init().then(() => window.requestAnimationFrame(renderLoop));
    }


    this.renderedObjects = {};    // TODO rename to renderedObjectContainers

    // TODO When the renderer gets uninitialised/removed (especially on server UI), remove these handlers
    this.gameEngine.on('objectAdded', this.onObjectAdded.bind(this));
    this.gameEngine.on('objectDestroyed', this.onObjectDestroyed.bind(this));
    this.gameEngine.on('postStep', this.postStep.bind(this));

  }

  initialize() {
    if (this.dd_initialized) return;
    this.dd_initialized = true;
    if (this.gameEngine.world) {
      for (let object of Object.values(this.gameEngine.world.objects)) {
        this.onObjectAdded(object);
      }
    }

  }

  getView() {
    return this.renderer.view;
  }


  postStep() {
    for (let key of Object.keys(this.renderedObjects)) {
      this.gameEngine.world.objects[key].tickSprite(this.gameEngine);
    }
  }

  draw() {
    if (!this.dd_initialized) throw new Error("Attempted to draw a DDRenderer that wasn't initialized! Initialize with DDRenderer.initialize() after constructor call (or ask the subclass author to add it to the end of their constructor)");
    if (this.clientEngine)
      super.draw();
  }

  runClientStep() {
    if (this.clientEngine)
      super.runClientStep();
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

  }

  removeRenderedObject(object) {

  }

}


DDRenderer.DummyRenderer = class extends DDRenderer {
  constructor(gameEngine, clientEngine, debugMode) {
    super(gameEngine, clientEngine, debugMode);
    this.initialize();
  }
}


module.exports = DDRenderer;
