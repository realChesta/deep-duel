'use strict';

class CreatureAction extends Serializable {

  constructor(name) {
    this.name = name;
    this.lockedUntil = 0;

  }




  static registerClasses() {
    serializer.registerClass(require('./GameObjects/Entities/ActionState'));
  }

}


require('../../Utils/ClassLoader').registerClass(CreatureAction);
module.exports = CreatureAction;
