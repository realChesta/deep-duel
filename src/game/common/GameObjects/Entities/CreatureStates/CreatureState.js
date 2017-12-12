'use strict';

const {serialize: {Serializable, Serializer}} = require('lance-gg');
const CreatureAction = require('./CreatureAction');
const CreatureResource = require('./CreatureResource');
const CreatureResourceHolder = require('./CreatureResourceHolder');

// TODO Consider moving some parts of Action into a new class Effect, which can be applied to a player outside of Action?
class CreatureState extends Serializable {

  static get netScheme() {
    return Object.assign({
      mainAction: {type: Serializer.TYPES.CLASSINSTANCE},
      baseHealth: {type: Serializer.TYPES.CLASSINSTANCE},
    }, super.netScheme);
  }

  syncTo(other) {
    super.syncTo(other);
    this.mainAction.syncTo(other.mainAction);
    this.baseHealth.syncTo(other.baseHealth);
  }

  constructor(gameObject, gameEngine, maxHealth) {
    super();
    // TODO HACK lance-gg doing shit again, calling this constructor on serialize
    this.gameObject = gameObject;
    this.gameEngine = gameEngine;
    this.mainAction = new CreatureAction(gameObject, gameEngine);
    this.baseHealth = new CreatureResource(maxHealth);
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




  tick(gameEngine) {
    this.mainAction.doTick(gameEngine);
  }

  getActionAnimationName() {
    return this.mainAction.type.animationName;
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
