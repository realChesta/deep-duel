'use strict';

const {serialize: {Serializable, Serializer}} = require('lance-gg');
const CreatureAction = require('./Actions/CreatureAction');

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

  constructor(animationChangeCallback) {
    super();
    this.mainAction = new CreatureAction(animationChangeCallback);
  }

  tick() {
    this.mainAction.tick();
  }

  getActionAnimationName() {
    return this.mainAction.type.animationName;
  }

  setMainActionType(type) {
    return this.mainAction.setType(type);
  }

}


require('../../Utils/ClassLoader').registerClass(CreatureState);
module.exports = CreatureState;
