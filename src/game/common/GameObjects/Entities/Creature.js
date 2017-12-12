'use strict';

const Entity = require('./Entity');
const Direction = require('../../Utils/Direction');
const Serializer = require('lance-gg').serialize.Serializer;
const CreatureState = require('./CreatureStates/CreatureState');
const Hitbox = require('../../Physics/Collision/Hitbox');

class Creature extends Entity {
  constructor(id, x, y) {
    super(id, x, y);

    this.state = new CreatureState(this);
    // TODO Consider moving direction to CreatureState
    // Actually pretty certain we gotta do that. Fits CreatureState much better
    this.inputDirection = Direction.ZERO;
    this.facingDirection = this.inputDirection;
  }

  static get netScheme() {
    return Object.assign({
      inputDirectionVector: {type: Serializer.TYPES.CLASSINSTANCE},
      state: {type: Serializer.TYPES.CLASSINSTANCE}
    }, super.netScheme);
  }

  syncTo(other) {
    super.syncTo(other);
    this.inputDirection = other.inputDirection;
    this.state.syncTo(other.state);
  }

  get inputDirectionVector() {
    return this.inputDirection.vector;
  }

  set inputDirectionVector(val) {
    this.inputDirection = Direction.getClosest(val);
  }

  get state() {
    return this._state;
  }

  set state(val) {
    if (val === this._state)
      return;
    this._state = val;
  }


  get inputDirection() {
    return this._inputDirection;
  }

  set inputDirection(val) {
    this._inputDirection = val;
  }

  get facingDirection() {
    return this._facingDirection || Direction.DOWN;
  }

  set facingDirection(val) {
    if (val === Direction.ZERO)
      val = null;
    if (val === this.facingDirection)
      return;
    let niu = val || this.facingDirection;
    this.onAnimationChange(undefined, niu.name);
    this._facingDirection = niu;
  }


  onAnimationChange(newAction, newFacingDirection) {}


  onAddToWorld(gameEngine) {
    super.onAddToWorld(gameEngine);
    gameEngine.on('preStep', this.state.tick.bind(this.state));
  }

}

require('../../Utils/ClassLoader').registerClass(Creature);
module.exports = Creature;
