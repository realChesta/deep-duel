'use strict';

const {serialize: {TwoVector}} = require('lance-gg');

class ArcCollider {
  static detectAttackCollision(gameEngine, position, direction, attackAngle, exclude) {
    // TODO Create broad and narrow phases for collision detection (don't check for collisions with everything)
    const sq = (x) => x * x;
    const mtzn = (f1, f2) => (f1 * f2 < 0) ? 0 : (Math.abs(f1) < Math.abs(f2) ? f1 : f2);
    const mtzv = (v1, v2) => new TwoVector(mtzn(v1.x, v2.x), mtzn(v1.y, v2.y))
    const mtz = function (vectors) {
      let c = vectors;
      for (let i = 1; i < arguments.length; i++) {
        c = mtzv(c, arguments[i]);
      }
      return c;
    }

    // TODO Move the constants
    const attackRange = 25;
    const xoff = 0;
    const yoff = 0;

    const sqrt2 = Math.sqrt(2);

    const dir = direction.clone().normalize();
    const dida = ArcCollider.toAngle(dir);
    const dirm = ArcCollider.fromAngle(dida - attackAngle);
    const dirp = ArcCollider.fromAngle(dida + attackAngle);
    // Processing sketch visualizing collision detection: https://pastebin.com/T8mjGLux
    // TODO Use less resources per check 'n stuff
    let hits = gameEngine.filterObjects(((obj) => {
      if (exclude[obj.id])
        return false;

      const hb = obj.hitbox;
      if (!hb)
        return false;

      const crad = attackRange;
      const rect = new TwoVector(hb.w, hb.h);
      const rect2 = rect.clone().multiplyScalar(0.5);
      const m = position.clone().subtract(obj.position);
      m.x += xoff - hb.xoff;
      m.y += yoff - hb.yoff;
      const absm = m.clone();
      absm.x = Math.abs(absm.x);
      absm.y = Math.abs(absm.y);
      const subrad = crad / sqrt2;
      const subm = m.clone().add(dir.clone().multiplyScalar(subrad));
      const corner = rect2.clone();   // TODO we might need to think about this again. Is this really correct? Should we base the corner on subm? Or do we need to check both subm or m corners? It doesn't matter with axis-aligned rects like this, but when it's do or die we might just as well do it right
      corner.x *= subm.x < 0 ? -1 : 1;
      corner.y *= subm.y < 0 ? -1 : 1;
      const difToCorner = subm.clone().subtract(corner);
      const triangleCorners = [
        m.clone(),
        m.clone().add(dirm.clone().multiplyScalar(sqrt2 * crad)),
        m.clone().add(dirp.clone().multiplyScalar(sqrt2 * crad))
      ];
      const bounding = mtz(m,
        m.clone().add(dir.clone().multiplyScalar(crad)),
        m.clone().add(dirm.clone().multiplyScalar(crad)),
        m.clone().add(dirp.clone().multiplyScalar(crad))
      );
      const absbounding = bounding.clone();
      absbounding.x = Math.abs(absbounding.x);
      absbounding.y = Math.abs(absbounding.y);

      // Easy case: Bounding does not touch the rectangle
      if (absbounding.x > rect2.x) return false;
      if (absbounding.y > rect2.y) return false;

      // Still easy case: The small circle touches an edge or is inside of rectangle
      if (Math.abs(subm.x) < rect2.x) return true;
      if (Math.abs(subm.y) < rect2.y) return true;

      // Hard case: Corner area. Both circles and the triangle must contain the corner
      // Big circle
      if (sq(difToCorner.x) + sq(difToCorner.y) > sq(crad)) return false;
      // Small circle
      if (sq(Math.abs(subm.x) - rect2.x) + sq(Math.abs(subm.y) - rect2.y) > sq(subrad)) return false;
      // Triangle
      if (!ArcCollider.isInTriangle(corner, triangleCorners)) return false;

      return true;


    }).bind(this));

    return hits;
  }

  static fromAngle(angle) {
    return new TwoVector(Math.cos(angle), Math.sin(angle))
  }

  static toAngle(vector) {
    return Math.atan2(vector.y, vector.x)
  }

  static isInTriangle(point, triangle) {
    const sgn = (p1, p2, p3) => {
      return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    };
    let b1 = sgn(point, triangle[0], triangle[1]) < 0;
    let b2 = sgn(point, triangle[1], triangle[2]) < 0;
    let b3 = sgn(point, triangle[2], triangle[0]) < 0;

    return (b1 == b2) && (b2 == b3);
  }
}


module.exports = ArcCollider;
