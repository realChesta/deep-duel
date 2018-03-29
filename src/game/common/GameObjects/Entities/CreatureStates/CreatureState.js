'use strict';

import Serializer from 'lance/serialize/Serializer';
import Serializable from 'lance/serialize/Serializable';
const CreatureAction = require('./CreatureAction');
const CreatureResource = require('./CreatureResource');
const CreatureResourceHolder = require('./CreatureResourceHolder');
const Direction = require('../../../Utils/Direction');

// TODO Consider moving some parts of Action into a new class Effect, which can be applied to a player outside of Action?
class CreatureState extends Serializable {

  static get netScheme() {
    return Object.assign({
      mainAction: {type: Serializer.TYPES.CLASSINSTANCE},
      baseHealth: {type: Serializer.TYPES.CLASSINSTANCE},
      inputDirectionVector: {type: Serializer.TYPES.CLASSINSTANCE},
      secondaryInputDirectionVector: {type: Serializer.TYPES.CLASSINSTANCE},
      facingDirectionVector: {type: Serializer.TYPES.CLASSINSTANCE},
      movingDirectionVector: {type: Serializer.TYPES.CLASSINSTANCE},
    }, super.netScheme);
  }

  syncTo(other) {
    super.syncTo(other);
    this.mainAction.syncTo(other.mainAction);
    this.baseHealth.syncTo(other.baseHealth);
    this.inputDirection = other.inputDirection;
    this.facingDirection = other.facingDirection;
  }

  constructor(gameObject, gameEngine, maxHealth) {
    super();
    // TODO HACK lance-gg doing shit again, calling this constructor on serialize
    this.gameObject = gameObject;
    this.gameEngine = gameEngine;
    this.mainAction = new CreatureAction(gameObject, gameEngine);
    this.baseHealth = new CreatureResource(maxHealth);

    this.inputDirection = Direction.ZERO;
    this.secondaryInputDirection = Direction.ZERO;
    this.facingDirection = this.secondaryInputDirection;
    this.movingDirection = this.inputDirection;
  }








  get healthResources() {
    return new CreatureResourceHolder([this.baseHealth]);   // TODO Add health resources from mainAction (and effects)
  }

  get health() {
    return this.healthResources.value;
  }

  get maxHealth() {
    return this.healthResources.max;
  }











  get inputDirectionVector() { return this.inputDirection.vector; }
  set inputDirectionVector(val) { this.inputDirection = Direction.getClosest(val); }
  get inputDirection() { return this._inputDirection; }
  set inputDirection(val) { this._inputDirection = val; }

  get secondaryInputDirectionVector() { return this.secondaryInputDirection.vector; }
  set secondaryInputDirectionVector(val) { this.secondaryInputDirection = Direction.getClosest(val); }
  get secondaryInputDirection() { return this._secondaryInputDirection; }
  set secondaryInputDirection(val) { this._secondaryInputDirection = val; }




  get facingDirectionVector() { return this.facingDirection.vector; }
  set facingDirectionVector(val) { this.facingDirection = Direction.getClosest(val); }
  get facingDirection() { return this._facingDirection || Direction.DOWN; }
  set facingDirection(val) {
    if (val === Direction.ZERO)
      val = null;
    if (val === this.facingDirection)
      return;
    let niu = val || this.facingDirection;
    this._facingDirection = niu;
  }

  get movingDirectionVector() { return this.movingDirection.vector; }
  set movingDirectionVector(val) { this.movingDirection = Direction.getClosest(val); }
  get movingDirection() { return this._movingDirection || Direction.DOWN; }
  set movingDirection(val) {
    if (val === this.movingDirection)
      return;
    let niu = val || this.movingDirection;
    this._movingDirection = niu;
  }













  tick(gameEngine) {
    this.mainAction.doTick(gameEngine);
  }

  getMainActionType() {
    return this.mainAction.type;
  }

  setMainActionType(type) {
    return this.mainAction.setType(type);
  }

}


require('../../../Utils/ClassLoader').registerClass(CreatureState);
module.exports = CreatureState;
