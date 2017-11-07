'use strict';

const Entity = require('./Entity');
const Direction = require('../../Utils/Direction');
const Serializer = require('lance-gg').serialize.Serializer;
const CreatureState = require('./CreatureState');

class Creature extends Entity {
  constructor(id, x, y) {
    super(id, x, y);

    this.state = new CreatureState(((newActionName) => {
      this.onAnimationChange(newActionName, undefined);
    }).bind(this));
    // TODO Consider moving direction to CreatureState
    // Actually pretty certain we gotta do that. Fits CreatureState much better
    this.direction = Direction.ZERO;
  }

  static get netScheme() {
    return Object.assign({
      directionVector: {type: Serializer.TYPES.CLASSINSTANCE},
      state: {type: Serializer.TYPES.CLASSINSTANCE}
    }, super.netScheme);
  }

  syncTo(other) {
    super.syncTo(other);
    this.direction = other.direction;
  }

  get directionVector() {
    return this.direction.vector;
  }

  set directionVector(val) {
    this.direction = Direction.getClosest(val);
  }

  get state() {
    return this._state;
  }

  set state(val) {
    if (val === this._state)
      return;
    this._state = val;
  }


  get direction() {
    return this._direction;
  }

  set direction(val) {
    if (val === this.direction)
      return;
    this.onAnimationChange(undefined, val.name);
    this._direction = val;
  }


  onAnimationChange(newAction, newDirection) {}


  onAddToWorld(gameEngine) {
    super.onAddToWorld(gameEngine);
    gameEngine.on('preStep', this.state.tick.bind(this.state));
  }

}

require('../../Utils/ClassLoader').registerClass(Creature);
module.exports = Creature;
