'use strict';

const Creature = require('./Creature');
const Direction = require('../../Utils/Direction');

class Character extends Creature {

  constructor(id, x, y, playerId) {
    super(id, x, y);
    this.playerId = playerId;

    this.class = Character;
  }


  processInput(gameEngine, inputData) {
    if (this.input === undefined) {
      this.input = {};
    }

    if (inputData.options.isDown)
      this.input[inputData.input] = gameEngine.world.stepCount;
    else
      delete this.input[inputData.input];
  }

  calcVelocity(gameEngine) {
    if (this.input) {       // While we have input data, override Direction received by the server // TODO Think about this for another second
      var arr = [];
      for (let key of Object.keys(Direction.AXES)) {
        if (this.input[key]) {
          arr[arr.length] = Direction.AXES[key];
        }
      }
      this.direction = Direction.getSum(arr);
    }

    if (this.direction == Direction.ZERO) {
      this.action = Creature.ActionType.Idle;
    }
    else {
      this.action = Creature.ActionType.Running;
    }

    this.velocity.copy(this.direction.vector);
    this.velocity.multiplyScalar(this.getSpeed());
  }

  tickInputs(gameEngine) {
    if (this.input === undefined)
      return;

    for (let key of Object.keys(this.input)) {
      if (gameEngine.world.stepCount - this.input[key] >= Character.keyGravity)
        delete this.input[key];
    }

    if (Object.keys(this.input).length <= 0) {
      delete this.input;
    }
  }

  keepAlive(gameEngine) {
    if (this.input === undefined)
      return;

    for (let key of Object.keys(this.input)) {
      if (this.input[key] > 0) {
        this.input[key] = gameEngine.world.stepCount;
      }
    }
  }

  fire() {
    // TODO Add projectiles
  }

  onAddToWorld() {

  }

}

Character.keyGravity = 60;

require('../../Utils/ClassLoader').registerClass(Character);
module.exports = Character;
