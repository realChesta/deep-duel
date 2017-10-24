'use strict'

const {serialize: {TwoVector}} = require('lance-gg');
const VectorUtils = require('./VectorUtils');

class Direction {

  constructor(name, vec) {
    this.vector = vec;
    if (this.vector.length() != 0)
      this.vector.normalize();
    this.name = name;
  }

  getAngle() {
    return Math.acos(this.vector.x);
  }


  static getSum(dirArray) {
    var sum = new TwoVector(0, 0);
    for (var i = 0; i < dirArray.length; i++) {
      sum.add(dirArray[i].vector);
    }
    return this.getClosest(sum);
  }

  static getClosest(vec) {
    return this.getClosestFrom(vec, Direction.ALL);
  }

  static getClosestAxis(vec) {
    return this.getClosestFrom(vec, Direction.AXES);
  }

  static getClosestFrom(vec, arr) {
    if (vec.length() == 0)
      return Direction.ZERO;
    var best = Direction.ZERO;
    var bestC = -1;
    for (var i = 0; i < arr.length; i++) {
      let cur = Math.abs(Math.PI - VectorUtils.getAngle(vec, arr[i]));
      if (cur > bestC) {
        best = arr[i];
        bestC = cur;
      }
    }
    return best;
  }

}

Direction.ZERO = new Direction('zero', new TwoVector(0, 0));

Direction.UP = new Direction('up', new TwoVector(0, 1));
Direction.DOWN = new Direction('down', new TwoVector(0, -1));
Direction.LEFT = new Direction('left', new TwoVector(-1, 0));
Direction.RIGHT = new Direction('right', new TwoVector(1, 0));

Direction.UPLEFT = new Direction('up-left', new TwoVector(-1, 1));
Direction.DOWNRIGHT = new Direction('down-right', new TwoVector(1, -1));
Direction.UPRIGHT = new Direction('left-right', new TwoVector(1, 1));
Direction.DOWNLEFT = new Direction('right-left', new TwoVector(-1, -1));

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
}, Direction.Axes);


module.exports = Direction;
