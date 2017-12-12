'use strict';

const {serialize: {Serializable, Serializer}} = require('lance-gg');

class CreatureResourceHolder extends Serializable {

  static get netScheme() {
    return Object.assign({
      resources: {type: Serializer.TYPES.LIST,
                  itemType: {type: Serializer.TYPES.CLASSINSTANCE}}
    }, super.netScheme);
  }

  syncTo(other) {
    this.resources = other.resources;
  }

  constructor(resources) {
    super();
    this.resources = resources;
  }

  get value() {
    let val = 0;
    for (let res of this.resources) {
      val += res.value;
    }
    return val;
  }

  get max() {
    let max = 0;
    for (let res of this.resources) {
      max += res.max;
    }
    return max;
  }

  increase(by) {
    if (by < 0) return -decrease(-by);

    for (let i = 0; i < this.resources.length; i++) {
      let res = this.resources[i];
      let v = res.value, m = res.max;
      if (v < m) {
        if (v + by <= m) {
          res.value += by;
          return 0;
        } else {
          by -= m - v;
          res.value = m;
        }
      }
    }

    return by;
  }

  decrease(by) {
    if (by < 0) return -increase(-by);

    for (let i = this.resources.length - 1; i >= 0; i--) {
      let res = this.resources[i];
      let v = res.value, m = res.max;
      if (v > 0) {
        if (v - by >= 0) {
          res.value -= by;
          return 0;
        } else {
          by -= v;
          res.value = 0;
        }
      }
    }

    return by;
  }

}

require('../../../Utils/ClassLoader').registerClass(CreatureResourceHolder, "dd_crh");
module.exports = CreatureResourceHolder;
