'use strict';

const Entity = require('./Entity');
const Direction = require('../../Utils/Direction');
const Serializer = require('lance-gg').serialize.Serializer;

class Creature extends Entity {
  constructor(id, x, y) {
    super(id, x, y);

    this._direction = Direction.ZERO; //0,1,2,3 = v,<,^,>
    this.action = Creature.ActionType.Idle;
  }

  static get netScheme() {
    return Object.assign({
      directionVector: {type: Serializer.TYPES.CLASSINSTANCE},
    }, super.netScheme);
  }

  syncTo(other) {
    super.syncTo(other);
    // Serializable.syncTo already deals with syncing properties. (I have absolutely no idea why DynamicObject does it nevertheless)
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

require('../../Utils/ClassLoader').registerClass(Creature);
module.exports = Creature;
