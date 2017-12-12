'use strict';

const {serialize: {Serializable, Serializer}} = require('lance-gg');

class CreatureResource extends Serializable {

  static get netScheme() {
    return Object.assign({
      value: {type: Serializer.TYPES.FLOAT32},
      max: {type: Serializer.TYPES.FLOAT32}
    }, super.netScheme);
  }

  syncTo(other) {
    this.max = other.max;
    this.value = other.value;
  }

  constructor(value, max) {
    super();
    if (max === undefined)
      max = value;
    if (value === undefined)
      value = max;

    this.max = max;
    this.value = value;
  }

}

require('../../../Utils/ClassLoader').registerClass(CreatureResource);
module.exports = CreatureResource;
