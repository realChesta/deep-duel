'use strict';

import DDRenderer from 'game/client/DDRenderer';
import BackgroundContainer from 'game/client/DefaultClient/Rendering/BackgroundContainer';
import pixiClear from 'game/client/DefaultClient/Rendering/pixiClear';
const PIXI = require('pixi.js');
import HealthBar from 'game/client/DefaultClient/Rendering/HealthBar';

class DDDefaultRenderer extends DDRenderer {
  constructor(gameEngine, clientEngine, debugMode) {
    console.log("sup");
    super(gameEngine, clientEngine, debugMode);

    const settings = this.gameEngine.settings;




    this.entirety = new PIXI.Container();

    this.background = new BackgroundContainer(this.gameEngine);
    this.entirety.addChild(this.background);

    this.stage = new PIXI.Container();
    this.entirety.addChild(this.stage);

    this.debugLayer = new PIXI.Graphics();
    this.entirety.addChild(this.debugLayer);

    this.uiLayer = new PIXI.Graphics();
    this.entirety.addChild(this.uiLayer);



    // Entirety (everything)
    this.entirety.scale.set(1, 1);
    initSuperLayer(this.entirety, this.stage);

    // Background
    this.background.scale.set(2, 2);
    initSubLayer(this.background, this.stage);

    // Stage (the game)
    this.stage.scale.set(2, 2);
    initFixedLayer(this.stage, settings.width, settings.height);

    // Debug UI layer // TODO Now that non-UI debug stuff has moved to the stage, do we want to remove this too?
    this.debugLayer.scale.set(1, 1);
    initSubLayer(this.debugLayer, this.entirety);

    // UI
    this.uiLayer.scale.set(2, 2);
    initSubLayer(this.uiLayer, this.entirety);



    this.renderer = PIXI.autoDetectRenderer(this.entirety.scale.x * this.entirety.renderWidth, this.entirety.scale.y * this.entirety.renderHeight);



    this.initialize();
  }



  draw() {
    super.draw();

    if (this.debugMode)
      pixiClear(this.debugLayer);      // TODO Maybe we shouldn't clear all children here
    pixiClear(this.uiLayer);

    for (let key of Object.keys(this.renderedObjects)) {
      this.drawObject(this.gameEngine.world.objects[key]);
    }

    this.drawUI();

    this.renderer.render(this.entirety);
  }


  drawUI() {
    if (this.clientEngine && this.clientEngine.character) {
      let character = this.clientEngine.character;

      let healthBar = new HealthBar(character);
      healthBar.position.x = this.uiLayer.renderWidth - healthBar.totalWidth;
      healthBar.position.y = 0;
      this.uiLayer.addChild(healthBar);

      let scoreText = new PIXI.Text("Score: " + character.score, {fontSize: 10, fill : 0xffffff});
      scoreText.position.x = 3;
      scoreText.position.y = 0;
      this.uiLayer.addChild(scoreText);

    }
  }

  drawObject(object) {
    var container = this.renderedObjects[object.id];
    container.parent.x = object.position.x;
    container.parent.y = object.position.y;
    object.drawSprite(container.normal, container.debug);
  }






  addRenderedObject(object) {
    if (this.renderedObjects[object.id]) {
      this.removeRenderedObject(object);
    }

    const container = new PIXI.Container();
    const normal = new PIXI.Container();
    container.addChild(normal);
    let debug = undefined;
    if (this.debugMode) {
      debug = new PIXI.Container();
      container.addChild(debug);
    }
    this.stage.addChild(container);
    object.initRenderContainer(normal, debug);
    this.renderedObjects[object.id] = {parent: container, normal: normal, debug: debug};
  }

  removeRenderedObject(object) {
    const container = this.renderedObjects[object.id];
    if (!container) {
      console.error("Tried to remove a RenderedObject that isn't in the pool!");
      return;
    }
    delete this.renderedObjects[object.id];
    object.onRenderContainerDestroy(container.normal, container.debug);
    this.stage.removeChild(container.parent);
  }



}


function initFixedLayer(layer, renderWidth, renderHeight) {
  layer.renderWidth = renderWidth;
  layer.renderHeight = renderHeight;
}

function initSuperLayer(layer, child) {
  Object.defineProperty(layer, 'renderWidth', { get: function() {
      return child.renderWidth * child.scale.x;
    }});

  Object.defineProperty(layer, 'renderHeight', { get: function() {
      return child.renderHeight * child.scale.y;
    }});
}

function initSubLayer(layer, parent) {
  Object.defineProperty(layer, 'renderWidth', { get: function() {
      return parent.renderWidth / this.scale.x;
    }});

  Object.defineProperty(layer, 'renderHeight', { get: function() {
      return parent.renderHeight / this.scale.y;
    }});
}





module.exports = DDDefaultRenderer;
