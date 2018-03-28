'use strict';

import Serializer from 'lance/serialize/Serializer';
import Creature from 'game/common/GameObjects/Entities/Creature';
import Projectile from 'game/common/GameObjects/Entities/Projectile';
import CreatureAction from './CreatureStates/CreatureAction';
import Direction from '../../Utils/Direction';
import Hitbox from '../../Physics/Collision/Hitbox';
import ArcCollider from '../../Physics/Collision/ArcCollider';
import TwoVector from 'lance/serialize/TwoVector';

class Character extends Creature {

  static get netScheme() {
    return Object.assign({
      score: {type: Serializer.TYPES.INT32},
    }, super.netScheme);
  }

  syncTo(other) {
    super.syncTo(other);
    this.score = other.score;
  }

  get actionTypes() {
    return Character.ActionTypes;
  }

  constructor(gameEngine, x, y, playerId) {
    super(gameEngine, x, y);
    this.playerId = playerId;
    this.hitbox = new Hitbox(26, 52);
    this.score = 0;
  }



  get actionTypes() {
    return Character.ActionTypes;
  }


  // TODO Check again whether all input data is checked for correct format and nothing can crash
  processInput(inputData) {
    if (this.input === undefined) {
      this.input = {};
    }

    if (inputData.options.isDown !== undefined) {   // Toggle/axis key
      if (inputData.options.isDown === true)
        this.input[inputData.input] = this.gameEngine.world.stepCount;
      else
        delete this.input[inputData.input];
    }
    else {          // Push key
      switch (inputData.input)
      {
        case 'attack':
          this.attack();
          break;
        case 'fire':
          this.fire();
          break;
        case 'dash':
          this.dash();
          break;
        default:
          console.warn('undefined input: ', inputData.input);
          break;
      }
    }
  }


  fire() {
    this.state.setMainActionType(Character.ActionTypes.Fire);
  }

  onFireTick(action, ticksPassed) {
    // TODO This assumes ticksPassed is confirmed to be equal to a given number at most once; is it?
    // TODO Move variables like radius, damage etc.
    if (ticksPassed === 15) {
      let pos = this.position.clone();
      let padd = this.facingDirection.vector.clone();
      padd.multiplyScalar(5);
      pos.add(padd);
      let velocity = this.facingDirection.vector.clone();
      velocity.multiplyScalar(1);
      let projectile = new Projectile(this.gameEngine, pos.x, pos.y, velocity, this, 5, 1);
      this.gameEngine.addObjectToWorld(projectile);
    }
  }

  dash() {
    this.state.setMainActionType(Character.ActionTypes.Dash);
    this.takeDamage(1);   // TODO Remove. This was only added for debug purposes
  }

  doDash(action) {
    const attackDashDistance = 8; // TODO move this to a better place
    this.velocity.add(this.facingDirection.vector.clone().multiplyScalar(attackDashDistance));
  }


  attack() {
    this.state.setMainActionType(Character.ActionTypes.Attack);
  }

  doAttack(action) {
    const attackDashDistance = 4; // TODO move this to a better place
    this.velocity.add(this.facingDirection.vector.clone().multiplyScalar(attackDashDistance));
  }

  onAttackTick(action, ticksPassed) {
    if (!action.actionData.excludeHitTargets) {     // TODO Rethink this; shouldn't a target be immune to the attack source if hit twice instead of this?
      action.actionData.excludeHitTargets = [];
      action.actionData.excludeHitTargets[this.id] = true;
    }


    // TODO Combine with detectAttackCollision's utility constants

    // TODO move the constants to a better place
    // TODO allow for different values in each instance
    const attackBreadth = 4;
    const checkAttackEveryTicks = 1;
    const attackStart = 4;
    const attackDuration = 14;
    const totalAttackAngle = Math.PI/4;

    let tpos = ticksPassed - attackStart;
    if (tpos < 0 || tpos > attackDuration || tpos % checkAttackEveryTicks != 0)
      return;

    tpos /= attackDuration;

    // 0.5 + ln(e^(kx) + e^(-kx))/k with x in [-0.5, 0.5]
    let x = (tpos - 0.5) * attackBreadth;
    let expx = Math.exp(x);
    let breadth = - Math.log(expx + 1/expx) / attackBreadth + 0.5;   // TODO Maybe create a look-up table? Maybe switch the function? See https://math.stackexchange.com/questions/30843/is-there-an-analytic-approximation-to-the-minimum-function

    let angF = ArcCollider.toAngle(this.facingDirection.vector) + totalAttackAngle;
    let direction = ArcCollider.fromAngle(angF - 2 * totalAttackAngle * tpos);
    let attackAngle = breadth * 2 * totalAttackAngle;

    this.debugMakeThisCoolerDirection = direction;     // TODO Find a cooler way to pass this to the debug mode renderer
    this.debugMakeThisCoolerAttackAngle = attackAngle;

    const hits = ArcCollider.detectAttackCollision(this.gameEngine, this.position, direction, attackAngle, action.actionData.excludeHitTargets);
    for (let hit of hits) {
      if (typeof hit.takeDamage === 'function')
        hit.takeDamage(1);
      action.actionData.excludeHitTargets[hit.id] = true;
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

    let targetV;
    if (action.getUseInputMovement()) {
      targetV = this.facingDirection.vector.clone();
      targetV.multiplyScalar(this.getSpeed());
      targetV.multiplyScalar(action.getInputMovementSpeed());
    } else {
      targetV = new TwoVector(0, 0);
    }

    const frictionForce = 0.35;    // TODO move this out
    let dif = this.velocity.clone().subtract(targetV);
    if (dif.length() <= frictionForce) {
      this.velocity = targetV;
    } else {
      this.velocity.add(dif.normalize().multiplyScalar(-frictionForce));
    }
  }

  // TODO move this to a cooler place, wherever we've moved the other stats
  getSpeed() {
    return 2;
  }

  // TODO move this to a cooler place, wherever we've moved the other stats
  getDefaultMaxHealth() {
    return 12;
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

  takeDamage(damage) {     // TODO Shouldn't taking damage/hurt be some kind of secondary action/effect?
    return super.takeDamage(damage);
  }



  initRenderContainer(container, debugContainer) {
    super.initRenderContainer(container, debugContainer);

    if (debugContainer) {
      this.hitboxDebugGraphics = new (require("pixi.js").Graphics)();
      debugContainer.addChild(this.hitboxDebugGraphics);
    }
  }

  onRenderContainerDestroy(container, debugContainer) {
    super.onRenderContainerDestroy(container, debugContainer);

    if (this.hitboxDebugGraphics) {
      if (debugContainer)
        debugContainer.removeChild(this.hitboxGraphics);    // We don't *need* to clean this up as it'll happen automatically, but it's still good practice to do
      this.hitboxDebugGraphics = undefined;
    }
  }



  drawSprite(container, debugContainer) {
    super.drawSprite(container, debugContainer);

    if (this.hitboxDebugGraphics) {
      if (this.debugMakeThisCoolerDirection && this.state.mainAction.type == Character.ActionTypes.Attack) {
        // TODO Merge constants with attack()'s constant (move them out)
        const fromAngle = (angle) => new TwoVector(Math.cos(angle), Math.sin(angle));
        const toAngle = (vector) => Math.atan2(vector.y, vector.x);
        const attackAngle = Math.abs(this.debugMakeThisCoolerAttackAngle);
        const attackRange = 25;

        const dir = this.debugMakeThisCoolerDirection;
        const dida = toAngle(dir);
        const dirm = fromAngle(dida - attackAngle);
        const dirp = fromAngle(dida + attackAngle);

        this.hitboxDebugGraphics.clear();
        this.hitboxDebugGraphics.lineStyle(1, 0x88FF88, 0.5);
        this.hitboxDebugGraphics.arc(0, 0, attackRange, dida - attackAngle, dida + attackAngle);
        this.hitboxDebugGraphics.moveTo(0, 0);
        this.hitboxDebugGraphics.lineTo(dirm.x * attackRange, dirm.y * attackRange);
        this.hitboxDebugGraphics.moveTo(0, 0);
        this.hitboxDebugGraphics.lineTo(dirp.x * attackRange, dirp.y * attackRange);
        this.hitboxDebugGraphics.moveTo(0, 0);
      }
    }
  }

}

Character.ActionTypes = {
  Idle: CreatureAction.Type.Idle.clone(Character, 'Character'),
  Running: CreatureAction.Type.Running.clone(Character, 'Character'),
  Attack: new CreatureAction.Type(Character, 'attack')
      .setLockDuration(40)
      .setActionLength(45)
      .onStart(function() { this.gameObject.doAttack(this); })
      .onTick(function(ticksPassed) {this.gameObject.onAttackTick(this, ticksPassed);}),
  Dash: new CreatureAction.Type(Character, 'attack-dash') // TODO 'attack-dash' until animations are here, then remove attack
      .setLockDuration(40)
      .setActionLength(45)
      .onStart(function() { this.gameObject.doDash(this); }),
  Fire: new CreatureAction.Type(Character, 'attack-fire') // TODO 'attack-fire' until animations are here, then remove attack
      .setLockDuration(30)
      .setActionLength(60)
      .onTick(function(ticksPassed) { this.gameObject.onFireTick(this, ticksPassed); }),
  Dead: CreatureAction.Type.Dead.clone(Character, 'Character')
      .setLockDuration(180)
      .setActionLength(180)
      .onStart(function() { this.gameObject.score--; })
      .onPrepareEnd(function(nextActionType) { return nextActionType !== Character.ActionTypes.Respawn; }),
  Spawn: CreatureAction.Type.Spawn.clone(Character, 'Character'),
  Respawn: new CreatureAction.Type(Character, 'respawn')
      .onStart(function() { this.gameObject.respawn(); })
      .setNextAction(null)
};
Character.ActionTypes.Dead.setNextAction(Character.ActionTypes.Respawn);

Character.keyGravity = 60;

require('../../Utils/ClassLoader').registerClass(Character);
module.exports = Character;
