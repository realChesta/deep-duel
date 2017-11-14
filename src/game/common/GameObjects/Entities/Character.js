'use strict';

const Creature = require('./Creature');
const CreatureAction = require('./Actions/CreatureAction');
const Direction = require('../../Utils/Direction');
const Hitbox = require('../../Physics/Collision/Hitbox');
const {serialize: {TwoVector}} = require('lance-gg');

class Character extends Creature {

  constructor(id, x, y, playerId) {
    super(id, x, y);
    this.playerId = playerId;
    this.hitbox = new Hitbox(26, 52);
  }


  processInput(inputData) {
    if (this.input === undefined) {
      this.input = {};
    }

    if (inputData.options.isDown !== undefined) {   // Toggle/axis key
      if (inputData.options.isDown === true)
        this.input[inputData.input] = this.gameEngine.world.stepCount;
      else
        delete this.input[inputData.input];


    } else {          // Push key
      if (inputData.input === 'attack') {
        this.attack();
      }

    }
  }


  attack() {
    this.state.setMainActionType(Character.ActionTypes.Attack);
  }

  // TODO Organize collision detection; create an ArcCollider or something alike
  // TODO Create broad and narrow phases for collision detection (don't check everything with everything)
  doAttack() {
    const sq = (x) => x*x;
    const fromAngle = (angle) => new TwoVector(Math.cos(angle), Math.sin(angle));
    const toAngle = (vector) => Math.atan2(vector.y, vector.x);
    const mtzn = (f1, f2) => (f1 * f2 < 0) ? 0 : (Math.abs(f1) < Math.abs(f2) ? f1 : f2);
    const mtzv = (v1, v2) => new TwoVector(mtzn(v1.x, v2.x), mtzn(v1.y, v2.y))
    const mtz = function(vectors) {
        let c = vectors;
        for (let i = 1; i < arguments.length; i++) {
          c = mtzv(c, arguments[i]);
        }
        return c;
    }
    const sgn = (p1, p2, p3) => {
      return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    }
    const isInTriangle = (point, triangle) => {
      let b1 = sgn(point, triangle[0], triangle[1]) < 0;
      let b2 = sgn(point, triangle[1], triangle[2]) < 0;
      let b3 = sgn(point, triangle[2], triangle[0]) < 0;

      return (b1 == b2) && (b2 == b3);
    }

    // TODO Move the constants
    const attackRange = 25;
    const attackAngle = Math.PI/4;
    const xoff = 0;
    const yoff = 0;

    const sqrt2 = Math.sqrt(2);

    const dir = this.facingDirection.vector.clone().normalize();
    const dida = toAngle(dir);
    const dirm = fromAngle(dida - attackAngle);
    const dirp = fromAngle(dida + attackAngle);

    // Processing sketch visualizing collision detection: https://pastebin.com/T8mjGLux
    // TODO Use less resources per check 'n stuff
    let hits = this.gameEngine.filterObjects(((obj) => {

        if (obj === this)
          return false;

        const hb = obj.hitbox;
        if (!hb)
          return false;

        const crad = attackRange;
        const rect = new TwoVector(hb.w, hb.h);
        const rect2 = rect.clone().multiplyScalar(0.5);
        const m = this.position.clone().subtract(obj.position);
            m.x += xoff - hb.xoff;
            m.y += yoff - hb.yoff;
        const absm = m.clone();
            absm.x = Math.abs(absm.x);
            absm.y = Math.abs(absm.y);
        const corner = rect2.clone();
            corner.x *= m.x < 0 ? -1 : 1;
            corner.y *= m.y < 0 ? -1 : 1;
        const difToCorner = m.clone().subtract(corner);
        const triangleCorners = [
            m.clone(),
            m.clone().add(dirm.clone().multiplyScalar(sqrt2 * crad)),
            m.clone().add(dirp.clone().multiplyScalar(sqrt2 * crad))
        ];
        const subrad = crad / sqrt2;
        const subm = m.clone().add(dir.clone().multiplyScalar(subrad));
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
        if (!isInTriangle(m.clone().subtract(difToCorner), triangleCorners)) return false;

        return true;


    }).bind(this));




    for (let hit of hits) {
      if (typeof hit.takeDamage === 'function')
        hit.takeDamage(1);
    }
  }

  calcVelocity(gameEngine) {
    let action = this.state.mainAction;

    if (this.input) {       // While we have input data, override input direction received by the server // TODO Think about this for another second
      var arr = [];
      for (let key of Object.keys(Direction.AXES)) {
        if (this.input[key]) {
          arr[arr.length] = Direction.AXES[key];
        }
      }
      this.inputDirection = Direction.getSum(arr);
    }

    if (this.inputDirection !== Direction.ZERO) {
      action.setType(Character.ActionTypes.Running);
    }

    if (!action.getFreezeDirection()) {
      this.facingDirection = this.inputDirection;
    }

    if (action.getUseInputMovement()) {
      let v = this.facingDirection.vector.clone();
      v.multiplyScalar(this.getSpeed());
      v.multiplyScalar(action.getInputMovementSpeed());
      this.position.add(v);
      this.velocity.set(0, 0);      // TODO Add actual friction physics instead of this shullbit
    }
  }

  tickInputs(gameEngine) {
    if (this.input === undefined)
      return;

    for (let key of Object.keys(this.input)) {
      if (gameEngine.world.stepCount - this.input[key] >= Character.keyGravity)
        delete this.input[key];
    }

    if (Object.keys(this.input).length <= 0) {
      delete this.input;
    }
  }

  keepAlive(gameEngine) {
    if (this.input === undefined)
      return;

    for (let key of Object.keys(this.input)) {
      if (this.input[key] > 0) {
        this.input[key] = gameEngine.world.stepCount;
      }
    }
  }

  fire() {
    // TODO Add projectiles
  }


  drawSprite(container, debugLayer) {
    super.drawSprite(container, debugLayer);

    if (debugLayer) {
      // TODO Merge constants with attack()'s constant (move them out)
      const fromAngle = (angle) => new TwoVector(Math.cos(angle), Math.sin(angle));
      const toAngle = (vector) => Math.atan2(vector.y, vector.x);
      const attackAngle = Math.PI/4;
      const attackRange = 25;

      const dida = toAngle(this.facingDirection.vector);
      const dirm = fromAngle(dida - attackAngle);
      const dirp = fromAngle(dida + attackAngle);

      debugLayer.lineStyle(1, 0x88FF88, 0.5);
      debugLayer.arc(this.position.x, this.position.y, attackRange, dida - attackAngle, dida + attackAngle);
      debugLayer.moveTo(this.position.x, this.position.y);
      debugLayer.lineTo(this.position.x + dirm.x * attackRange, this.position.y + dirm.y * attackRange);
      debugLayer.moveTo(this.position.x, this.position.y);
      debugLayer.lineTo(this.position.x + dirp.x * attackRange, this.position.y + dirp.y * attackRange);
      debugLayer.moveTo(0, 0);
    }
  }

}

Character.ActionTypes = {
  Idle: CreatureAction.Type.Idle,
  Running: CreatureAction.Type.Running,
  Attack: new CreatureAction.Type(Character, 'attack')
      .setLockDuration(30)
      .setActionLength(60)
      .onStart(function() {this.gameObject.doAttack()})
};

Character.keyGravity = 60;

require('../../Utils/ClassLoader').registerClass(Character);
module.exports = Character;
