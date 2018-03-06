'use strict';

import TwoVector from 'lance/serialize/TwoVector';
const VectorUtils = require('./VectorUtils');


// TODO think about whether it makes sense to serialize this
class Direction {

  constructor(name, vec) {
    this.vector = vec;
    if (this.vector.length() != 0)
      this.vector.normalize();
    this.name = name;
  }

  copy(other) {
    this.name = other.name;
    this.vector.copy(other.vector);
  }

  static getSum(dirArray) {
    var sum = new TwoVector(0, 0);
    for (var i = 0; i < dirArray.length; i++) {
      sum.add(dirArray[i].vector);
    }
    return Direction.getClosest(sum);
  }

  static getClosest(vec) {
    return Direction.getClosestFrom(vec, Object.values(Direction.ALL));
  }

  static getClosestAxis(vec) {
    return Direction.getClosestFrom(vec, Object.values(Direction.AXES));
  }

  static getClosestFrom(vec, arr) {
    if (vec.length() == 0)
      return Direction.ZERO;
    var best = Direction.ZERO;
    var bestC = -1;
    for (let i = 0; i < arr.length; i++) {
      let cur = Math.abs(Math.PI - VectorUtils.getAngle(vec, arr[i].vector));
      if (cur > bestC) {
        best = arr[i];
        bestC = cur;
      }
    }
    return best;
  }

}

Direction.ZERO = new Direction('zero', new TwoVector(0, 0));

Direction.UP = new Direction('up', new TwoVector(0, -1));
Direction.DOWN = new Direction('down', new TwoVector(0, 1));
Direction.LEFT = new Direction('left', new TwoVector(-1, 0));
Direction.RIGHT = new Direction('right', new TwoVector(1, 0));

Direction.UPLEFT = new Direction('up-left', new TwoVector(-1, -1));
Direction.DOWNRIGHT = new Direction('down-right', new TwoVector(1, 1));
Direction.UPRIGHT = new Direction('up-right', new TwoVector(1, -1));
Direction.DOWNLEFT = new Direction('down-left', new TwoVector(-1, 1));

Direction.AXES = {
  'up': Direction.UP,
  'down': Direction.DOWN,
  'left': Direction.LEFT,
  'right': Direction.RIGHT
};

Direction.ALL = Object.assign({
  'up-left': Direction.UPLEFT,
  'down-right': Direction.DOWNRIGHT,
  'up-right': Direction.UPRIGHT,
  'down-left': Direction.DOWNLEFT
}, Direction.AXES);


module.exports = Direction;
