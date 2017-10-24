'use strict';

const {render: {Renderer}} = require('lance-gg');
const PIXI = require('pixi.js');
const Player = require('../../common/GameObjects/Entities/Character');

class DDRenderer extends Renderer {


  constructor(gameEngine, clientEngine) {
    super(gameEngine, clientEngine);

    this.stage = new PIXI.Container();
    this.stage.scale.set(4, 4);
    this.renderer = PIXI.autoDetectRenderer(this.stage.scale.x * this.gameEngine.settings.width, this.stage.scale.y * this.gameEngine.settings.height);

    this.renderedObjects = {};
  }


  //TODO: call this somewhere
  load(callback) {

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    PIXI.loader
      .add(Object.values(DDRenderer.player_sheets[Player.ActionType.Idle].contents))
      .add(Object.values(DDRenderer.player_sheets[Player.ActionType.Running].contents))
      .load(callback);
  }

  static createAnimatedSprite(jsonPath, nOfFrames, fps, x, y) {
    let frames = [];

    for (let i = 0; i < nOfFrames; i++) {
      frames.push(PIXI.Texture.fromFrame(jsonPath.replace(/^.*[\\\/]/, '').replace('\.json', i + '.png')));
    }

    let anim = new PIXI.extras.AnimatedSprite(frames);
    anim.x += x;
    anim.y += y;

    anim.animationSpeed = fps / 60;

    return anim;
  }


  getView() {
    return this.renderer.view;
  }


  draw() {
    super.draw();
    console.log("Hi!");

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
      console.error("Tried to remove a RenderedObject that wasn't even added to the pool to begin with!");
      return;
    }
    delete this.renderedObjects[object.id];
    object.onRenderContainerDestroy(container);
    this.stage.removeChild(container);
  }

}

DDRenderer.player_sheets = [
  //idle
  {
    frames: 7,
    fps: 5,
    contents: {
      down: 'assets/player/idle/player_idle_front.json',
      left: 'assets/player/idle/player_idle_left.json',
      up: 'assets/player/idle/player_idle_back.json',
      right: 'assets/player/idle/player_idle_right.json'
    }
  },
  //run
  {
    frames: 8,
    fps: 13,
    contents: {
      down: 'assets/player/run/player_run_front.json',
      left: 'assets/player/run/player_run_left.json',
      up: 'assets/player/run/player_run_back.json',
      right: 'assets/player/run/player_run_right.json'
    }
  }
];


// TODO HACK
require('../../common/Utils/SpriteLoader')
  .addAll('player.idle', Object.values(DDRenderer.player_sheets[0].contents))
  .addAll('player.running', Object.values(DDRenderer.player_sheets[1].contents));

module.exports = DDRenderer;
