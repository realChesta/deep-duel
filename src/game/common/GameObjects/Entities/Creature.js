'use strict';

import Entity from './Entity';
import Serializer from 'lance/serialize/Serializer';
import CreatureState from './CreatureStates/CreatureState';
import CreatureAction from './CreatureStates/CreatureAction';
import Hitbox from '../../Physics/Collision/Hitbox';

class Creature extends Entity {

  constructor(gameEngine, x, y) {
    super(gameEngine, x, y);
    this.spawnX = x;
    this.spawnY = y;
  }

  onAddToWorld(gameEngine) {
    super.onAddToWorld(gameEngine);
    this.respawn();
  }

  // TODO Consider removing respawn logic; when a player/whatever needs to respawn, spawn a new gameobject
  respawn() {
    this.state = new CreatureState(this, this.gameEngine, this.getDefaultMaxHealth());
    this.position.x = this.spawnX;
    this.position.y = this.spawnY;
    this.velocity.x = 0;
    this.velocity.y = 0;
  }

  tick(gameEngine) {
    this.state.tick(gameEngine);
  }

  get actionTypes() {
    return Creature.ActionTypes;
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


  isDamageable() {
    return this.state.mainAction.getIsDamageable();
  }

  takeDamage(damage) {
    super.takeDamage(damage);
    let r = this.state.healthResources.decrease(damage);
    if (this.state.health <= 0) {
      let deadAction = this.actionTypes.Dead;
      if (deadAction) this.state.setMainActionType(deadAction);
    }
    return r;
  }

}

Creature.ActionTypes = CreatureAction.Type;

require('../../Utils/ClassLoader').registerClass(Creature);
module.exports = Creature;
