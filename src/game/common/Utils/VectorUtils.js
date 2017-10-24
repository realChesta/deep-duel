'use strict'

class VectorUtils {
  constructor() {
    throw new Error("Util class VectorUtils can't be instantiated");
  }


  static dotProduct(vec1, vec2) {
    return vec1.x * vec2.x + vec1.y * vec2.y;
  }

  static getAngle(vec1, vec2) {
    return Math.acos(dotProduct(vec1, vec2) / (vec1.length() * vec2.length()));
  }
}


module.exports = VectorUtils;
