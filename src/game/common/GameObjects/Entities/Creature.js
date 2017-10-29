'use strict';

const Entity = require('./Entity');
const Direction = require('../../Utils/Direction');
const Serializer = require('lance-gg').serialize.Serializer;

class Creature extends Entity {
  constructor(id, x, y) {
    super(id, x, y);

    this._direction = Direction.DOWN; //0,1,2,3 = v,<,^,>
    this._action = Creature.ActionType.Idle;
  }

  static get netScheme() {
    return Object.assign({
      directionVector: {type: Serializer.TYPES.CLASSINSTANCE},
      _action: {type: Serializer.TYPES.STRING}
    }, super.netScheme);
  }

  syncTo(other) {
    super.syncTo(other);
    console.log("syncTo", this._action, other._action);
    this.direction = Direction.getClosest(other.directionVector);

    if (this.action)    // TODO HACK
      this.action = other._action;
  }

  get directionVector() {
    return this._direction.vector;
  }

  set directionVector(val) {
    this.direction = Direction.getClosest(val);
  }

  get action() {
    return this._action;
  }

  set action(val) {
    if (val === this._action)
      return;
    this.onActionChange(this._action, val);
    this._action = val;
  }


  get direction() {
    return this._direction;
  }

  set direction(val) {
    if (val === this.direction)
      return;
    this.onDirectionChange(this._direction, val);
    this._direction = val;
  }


  onActionChange(oldAction, newAction) {
  }

  onDirectionChange(oldDirection, newDirection) {
  }

}

// TODO create an extendable class instead of a String enumeration
Creature.ActionType = {
  Idle: 'idle',
  Running: 'running',
  Melee: 'melee',
  Shooting: 'shooting'
};

module.exports = Creature;
