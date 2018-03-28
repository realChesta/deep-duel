'use strict';

import TwoVector from 'lance/serialize/TwoVector';

// TODO Create computed properties instead of getters
class Hitbox {

  constructor(w, h, xoff, yoff) {
    this.w = w;
    this.h = h;
    this.xoff = xoff || 0;
    this.yoff = yoff || 0;
  }

  getCorners(pos) {
    return [
      this.getUpperLeft(pos),
      this.getUpperRight(pos),
      this.getLowerLeft(pos),
      this.getLowerRight(pos)
    ];
  }

  getUpperLeft(pos) {
    pos = pos || {x: 0, y: 0};
    return new TwoVector(this.getLeft(pos), this.getUpper(pos));
  }

  getUpperRight(pos) {
    pos = pos || {x: 0, y: 0};
    return new TwoVector(this.getRight(pos), this.getUpper(pos));
  }

  getLowerLeft(pos) {
    pos = pos || {x: 0, y: 0};
    return new TwoVector(this.getLeft(pos), this.getLower(pos));
  }

  getLowerRight(pos) {
    pos = pos || {x: 0, y: 0};
    return new TwoVector(this.getRight(pos), this.getLower(pos));
  }




  getLeft(pos) {
    return pos.x - this.w/2 + this.xoff;
  }

  getRight(pos) {
    return pos.x + this.w/2 + this.xoff;
  }

  getUpper(pos) {
    return pos.y - this.h/2 + this.yoff;
  }

  getLower(pos) {
    return pos.y + this.h/2 + this.yoff;
  }



}


module.exports = Hitbox;
