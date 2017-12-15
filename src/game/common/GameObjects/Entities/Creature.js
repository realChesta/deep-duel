'use strict';

const Entity = require('./Entity');
const Serializer = require('lance-gg').serialize.Serializer;
const CreatureState = require('./CreatureStates/CreatureState');
const Hitbox = require('../../Physics/Collision/Hitbox');

class Creature extends Entity {

  constructor(id, x, y) {
    super(id, x, y);
  }

  onAddToWorld(gameEngine) {
    super.onAddToWorld(gameEngine);
    this.state = new CreatureState(this, gameEngine, this.getDefaultMaxHealth());

    // TODO We need to remove this? Is it maybe better to not bind, and instead have tick() called by the game engine?
    gameEngine.on('preStep', this.state.tick.bind(this.state, gameEngine));

  }

  getDefaultMaxHealth() {
    return 12;
  }

  static get netScheme() {
    return Object.assign({
      state: {type: Serializer.TYPES.CLASSINSTANCE},
    }, super.netScheme);
  }

  syncTo(other) {
    super.syncTo(other);
    if (this.state) this.state.syncTo(other.state);
    else this.state = other.state;
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
    return this.state.inputDirection;
  }
  set inputDirection(val) {
    this.state.inputDirection = val;
  }
  get facingDirection() {
    return this.state.facingDirection;
  }
  set facingDirection(val) {
    this.state.facingDirection = val;
  }




  get health() {
    return this.state.health;
  }

  get maxHealth() {
    return this.state.maxHealth;
  }


  takeDamage(damage) {
    super.takeDamage(damage);
    return this.state.healthResources.decrease(damage);
  }

}

require('../../Utils/ClassLoader').registerClass(Creature);
module.exports = Creature;
