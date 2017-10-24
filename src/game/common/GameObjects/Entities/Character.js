'use strict';

const Creature = require('./Creature');
const {serialize: {Serializer}} = require('lance-gg');
const Direction = require('../../Utils/Direction');

class Character extends Creature {

  constructor(id, x, y, playerId) {
    super(id, x, y);
    this.playerId = playerId;

    this.direction = Direction.DOWN; //0,1,2,3 = v,<,^,>
    this.currentAction = Creature.ActionType.Idle;

    this.sprites = [];

    this.input = {};

    this.class = Character;
  }


  processInput(inputData) {
    if (inputData.options.isDown)
      this.input[inputData.input] = 10;
    else
      delete this.input[inputData.input];
  }

  calcVelocity() {
    var arr = [];
    Object.keys(Direction.AXES).forEach(function (key) {
      if (this.input[key] >= 0)
        arr[arr.length] = Direction.AXES[key];
    }.bind(this));
    this.direction = Direction.getSum(arr);

    if (this.direction == Direction.ZERO) {
      this.currentAction = Creature.ActionType.Idle;
    }
    else {
      this.currentAction = Creature.ActionType.Running;
    }

    this.velocity.copy(this.direction.vector);
    this.velocity.multiplyScalar(this.getSpeed());
  }

  tickInputs() {
    Object.keys(this.input).forEach(function (key) {
      if (--this.input[key] <= 0)
        delete this.input[key];
    });
  }

  initRenderContainer() {
    const DDRenderer = require('../../../client/Rendering/DDRenderer');

    this.sprites = [];

    //TODO: dynamic length?
    for (let i = 0; i < 2; i++) {
      this.sprites[i] = {};

      let sheets = DDRenderer.player_sheets[i];

      //create sprites and load them into our object with directions corresponding to numbers: 0,1,2,3 = v,<,^,>
      Object.keys(sheets.contents).forEach(function (key) {
        this.sprites[i][key] = DDRenderer.createAnimatedSprite(sheets.contents[key], sheets.frames, sheets.fps, -7, -9);
      }.bind(this));
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
    let dir = this.direction.name;
    console.log(dir);
    if ((this.currentAction !== this.lastStates.ActionType) || (dir !== this.lastStates.direction)) {

      if (this.lastStates.ActionType >= 0) {
        let oa = this.sprites[this.lastStates.ActionType][this.lastStates.Direction];
        oa.stop();
        container.removeChild(oa);
      }

      let newanim = this.sprites[this.currentAction][dir];
      newanim.play();

      container.addChild(newanim);

    }

    this.lastStates.ActionType = this.currentAction;
    this.lastStates.Direction = dir;
  }

}

// Character.ActionType = {
//   Idle: 'idle',
//   Running: 'running',
//   Melee: 'melee',
//   Shooting: 'shooting'
// };

module.exports = Character;
