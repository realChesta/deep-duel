'use strict';

const Entity = require('./Entity');
const Direction = require('../../Utils/Direction');
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
    // TODO Consider moving direction to CreatureState
    // Actually pretty certain we gotta do that. Fits CreatureState much better
    this.inputDirection = Direction.ZERO;
    this.facingDirection = this.inputDirection;

    // TODO We need to remove this? Is it maybe better to not bind, and instead have tick() called by the game engine?
    gameEngine.on('preStep', this.state.tick.bind(this.state, gameEngine));

  }

  getDefaultMaxHealth() {
    return 12;
  }

  static get netScheme() {
    return Object.assign({
      inputDirectionVector: {type: Serializer.TYPES.CLASSINSTANCE},
      state: {type: Serializer.TYPES.CLASSINSTANCE},
    }, super.netScheme);
  }

  syncTo(other) {
    super.syncTo(other);
    this.inputDirection = other.inputDirection;
    if (this.state) this.state.syncTo(other.state);
    else this.state = other.state;
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




  get health() {
    return this.state.health;
  }

  get maxHealth() {
    return this.state.maxHealth;
  }


  takeDamage(damage) {
    super.takeDamage(damage);
    this.state.healthResources.decrease(damage);
    console.log("Ouchie! I tooks " + damage + " damagez! Health: " + this.health + "/" + this.maxHealth + ". Creature[" + this.id + "].takeDamage(damage)");
  }





  onAnimationChange(newAction, newFacingDirection) {}

}

require('../../Utils/ClassLoader').registerClass(Creature);
module.exports = Creature;
