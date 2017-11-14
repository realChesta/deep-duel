'use strict';

const Creature = require('./Creature');
const CreatureAction = require('./Actions/CreatureAction');
const Direction = require('../../Utils/Direction');

class Character extends Creature {

  constructor(id, x, y, playerId) {
    super(id, x, y);
    this.playerId = playerId;
  }


  processInput(gameEngine, inputData) {
    if (this.input === undefined) {
      this.input = {};
    }

    if (inputData.options.isDown !== undefined) {   // Toggle/axis key
      if (inputData.options.isDown === true)
        this.input[inputData.input] = gameEngine.world.stepCount;
      else
        delete this.input[inputData.input];


    } else {          // Push key
      if (inputData.input === 'attack') {
        this.attack();
      }

    }
  }

  attack() {
    this.state.setMainActionType(Character.ActionTypes.Attack);
  }

  calcVelocity(gameEngine) {
    let action = this.state.mainAction;

    if (this.input) {       // While we have input data, override input direction received by the server // TODO Think about this for another second
      var arr = [];
      for (let key of Object.keys(Direction.AXES)) {
        if (this.input[key]) {
          arr[arr.length] = Direction.AXES[key];
        }
      }
      this.inputDirection = Direction.getSum(arr);
    }

    if (this.inputDirection !== Direction.ZERO) {
      action.setType(Character.ActionTypes.Running);
    }

    if (!action.type.getFreezeDirection()) {
      this.facingDirection = this.inputDirection;
    }

    if (action.type.getUseInputMovement()) {
      let v = this.facingDirection.vector.clone();
      v.multiplyScalar(this.getSpeed());
      v.multiplyScalar(action.type.getInputMovementSpeed());
      this.position.add(v);
      this.velocity.set(0, 0);      // TODO Add actual friction physics instead of this shullbit
    }
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

}

Character.ActionTypes = {
  Idle: CreatureAction.Type.Idle,
  Running: CreatureAction.Type.Running,
  Attack: new CreatureAction.Type(Character, 'attack')
      .setLockDuration(30)
      .setActionLength(60)
};

Character.keyGravity = 60;

require('../../Utils/ClassLoader').registerClass(Character);
module.exports = Character;
