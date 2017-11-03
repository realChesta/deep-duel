'use strict';

const CreatureAction = require('./Actions/CreatureAction');

class CreatureState extends Serializable {

  static get netScheme() {
    return Object.assign({
      mainAction: {type: Serializer.TYPES.CLASSINSTANCE},
    }, super.netScheme);
  }

  constructor() {
    this.mainAction = CreatureAction.Idle;
  }

}


require('../../Utils/ClassLoader').registerClass(CreatureState);
module.exports = CreatureState;
