'use strict';

const {serialize: {Serializable, Serializer}} = require('lance-gg');
const CreatureAction = require('./CreatureAction');

// TODO Consider moving some parts of Action into a new class Effect, which can be applied to a player outside of Action?
class CreatureState extends Serializable {

  static get netScheme() {
    return Object.assign({
      mainAction: {type: Serializer.TYPES.CLASSINSTANCE}
    }, super.netScheme);
  }

  syncTo(other) {
    super.syncTo(other);
    this.mainAction.syncTo(other.mainAction);
  }

  constructor(gameObject) {
    super();
    this.gameObject = gameObject;
    this.mainAction = new CreatureAction(gameObject);
  }

  tick() {
    this.mainAction.doTick();
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
