'use strict';

const Creature = require('./Creature');
const {serialize: {Serializer}} = require('lance-gg'); // QUESTION: this is never used in this class, is this necessary for the Serializer in some way or can it be removed?
const Direction = require('../../Utils/Direction');

class Character extends Creature {

  constructor(id, x, y, playerId) {
    super(id, x, y);
    this.playerId = playerId;

    this.sprites = [];

    this.input = {};

    this.class = Character;
  }


  processInput(inputData) {
    if (inputData.options.isDown)
      this.input[inputData.input] = 30;
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
      this.action = Creature.ActionType.Idle;
    }
    else {
      this.action = Creature.ActionType.Running;
    }

    this.velocity.copy(this.direction.vector);
    this.velocity.multiplyScalar(this.getSpeed());
  }

  tickInputs() {
    for (let key of Object.keys(this.input)) {
      if (--this.input[key] <= 0)
        delete this.input[key];
    }
  }

  fire() {
    // TODO Add projectiles
    //
  }

  onAddToWorld() {

  }

}

module.exports = Character;
