'use strict';

const Entity = require('./Entity');
const {serialize: {Serializer}} = require('lance-gg');

class Player extends Entity {

  constructor(id, x, y, playerId) {
    super(id, x, y);
    this.playerId = playerId;

    this.movingX = 0;
    this.movingY = 0;

    this.direction = 0; //0,1,2,3 = v,<,^,>
    this.currentAction = Player.ActionType.Idle;

    this.sprites = [];

    this.class = Player;
  }

  initRenderContainer() {
    const DDRenderer = require('../../../client/Rendering/DDRenderer');

    this.sprites = [];

    //TODO: dynamic length?
    for (let i = 0; i < 2; i++) {
      this.sprites[i] = [];

      let sheets = DDRenderer.player_sheets[i];

      //create sprites and load them into our object with directions corresponding to numbers: 0,1,2,3 = v,<,^,>
      for (let j = 0; j < sheets.contents.length; j++) {
        this.sprites[i][j] = DDRenderer.createAnimatedSprite(sheets.contents[j], sheets.frames, sheets.fps, -7, -9);
      }
    }

    this.lastStates = {
      "ActionType": -1,
      "Direction": -1
    };
  }

  fire() {
    // TODO Add projectiles
  }

  onAddToWorld() {

  }

  drawSprite(container) {
    if ((this.currentAction !== this.lastStates.ActionType) || (this.direction !== this.lastStates.direction)) {

      if (this.lastStates.ActionType >= 0) {
        let oa = this.sprites[this.lastStates.ActionType][this.lastStates.Direction];
        oa.stop();
        container.removeChild(oa);
      }

      let newanim = this.sprites[this.currentAction][this.direction];
      newanim.play();

      container.addChild(newanim);

    }

    this.lastStates.ActionType = this.currentAction;
    this.lastStates.Direction = this.direction;
  }

}

Player.ActionType = {
  Idle: 0,
  Running: 1,
  Melee: 2,
  Shooting: 3
};

module.exports = Player;
