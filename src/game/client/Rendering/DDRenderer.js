'use strict';

const {render: {Renderer}} = require('lance-gg');
const PIXI = require('pixi.js');
const RenderedObject = require('../../common/GameObjects/RenderedObject');
const SpriteLoader = require('../../common/Utils/SpriteLoader');

class DDRenderer extends Renderer {


  constructor(gameEngine, clientEngine, debugMode) {
    super(gameEngine, clientEngine);
    this.debugMode = debugMode || (clientEngine && clientEngine.options.debugMode === 'true');


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


    if (!DDRenderer.sprites)
      DDRenderer.sprites = {hearts: SpriteLoader.getSpritesheet(heartsSpritesId)};




    if (!this.clientEngine) {
      let trenderer = this;
      let renderLoop = (function() {
        trenderer.draw();
        window.requestAnimationFrame(renderLoop);
      }).bind(true);
      this.init().then(() => window.requestAnimationFrame(renderLoop));
    }


    this.renderedObjects = {};    // TODO rename to renderedObjectContainers

    // TODO When the renderer gets uninitialised/removed (especially on server UI), remove these handlers
    this.gameEngine.on('objectAdded', this.onObjectAdded.bind(this));
    this.gameEngine.on('objectDestroyed', this.onObjectDestroyed.bind(this));
    this.gameEngine.on('preStep', this.preStep.bind(this));

    if (this.gameEngine.world) {
      for (let object of Object.values(this.gameEngine.world.objects)) {
        this.onObjectAdded(object);
      }
    }


  }


  getView() {
    return this.renderer.view;
  }


  preStep() {
    for (let key of Object.keys(this.renderedObjects)) {
      this.gameEngine.world.objects[key].tickSprite(this.gameEngine);
    }
  }

  draw() {
    if (this.clientEngine)
      super.draw();

    if (this.debugMode)
      DDRenderer.pixiClear(this.debugLayer);      // TODO Maybe we shouldn't clear all children here
    DDRenderer.pixiClear(this.uiLayer);

    for (let key of Object.keys(this.renderedObjects)) {
      this.drawObject.call(this, this.gameEngine.world.objects[key]);
    }

    // TODO r console.log(this.clientEngine.character, DDRenderer.sprites);
    if (this.clientEngine && this.clientEngine.character && DDRenderer.sprites.hearts) {
      let character = this.clientEngine.character;
      let maxHealth = character.maxHealth;
      let health = character.health;
      let heartsSprites = DDRenderer.sprites.hearts;
      let healthBar = new PIXI.Container();
      let texturesArr = Object.values(heartsSprites.textures);
      let sc = texturesArr.length;
      healthBar.position.x = this.gameEngine.settings.width - Math.ceil(maxHealth / sc) * texturesArr[0].width;   // TODO Instead of checking the first texture, make this dynamic
      healthBar.position.y = 0;
      for (let i = 0; i < Math.ceil(health / sc); i++) {
        let txt = texturesArr[sc - Math.min(health - i * sc, sc)];
        let heart = new PIXI.Sprite(txt);
        heart.position.x = i * txt.width + heartsSprites.offset.x;
        heart.position.y = heartsSprites.offset.y;
        healthBar.addChild(heart);
      }
      this.uiLayer.addChild(healthBar);
    }

    this.renderer.render(this.entirety);
  }


  static pixiClear(pixiW) {
    for (var i = pixiW.children.length - 1; i >= 0; i--) {
      pixiW.removeChild(pixiW.children[i]);
    };
    pixiW.clear();
  }


  runClientStep() {
    if (this.clientEngine)
      super.runClientStep();
  }

  drawObject(object) {
    var container = this.renderedObjects[object.id];
    container.x = object.position.x;
    container.y = object.position.y;
    object.drawSprite(container, this.debugMode ? this.debugLayer : undefined);
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


const heartsSpritesId = SpriteLoader.add('assets/ui/hearts/red.json');


module.exports = DDRenderer;
