'use strict';

const {serialize: {Serializable}} = require('lance-gg');
const CreatureAction = require('./Actions/CreatureAction');

class CreatureState extends Serializable {

  static get netScheme() {
    return Object.assign({
      // Quite dusty here...
    }, super.netScheme);
  }

  syncTo(other) {
    // Quite dusty here...
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
