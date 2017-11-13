'use strict';

const {serialize: {Serializable, Serializer}} = require('lance-gg');
const Utils = require('lance-gg/src/lib/Utils');
const Creature = require('../Creature');

class CreatureAction extends Serializable {

  static get netScheme() {
    return Object.assign({
      typeId: {type: Serializer.TYPES.INT32},
      lockedFor: {type: Serializer.TYPES.INT32},
      switchIn: {type: Serializer.TYPES.INT32}
    }, super.netScheme);
  }

  syncTo(other) {
    super.syncTo(other);
    // TODO remove console.log("a", this.type, other.type)
    this.forceSetType(other.type);
    this.lockedFor = other.lockedFor;
    this.switchIn = other.switchIn;
  }

  constructor(animationChangeCallback) {
    super();
    this.animationChangeCallback = animationChangeCallback;
    this.setType(CreatureAction.Type.Idle);
  }



  get typeId() {
    return this.type.id;
  }

  set typeId(val) {
    this.forceSetType(CreatureAction.registeredTypes[val]);
  }

  get type() {
    return this._type;
  }

  setType(val) {
    if (this.lockedFor > 0)
      return false;

    this.lockedFor = val.getLockDuration();
    this.switchIn = val.getActionLength();
    this.forceSetType(val);
    return true;
  }

  forceSetType(val) {
    if (this.animationChangeCallback !== undefined && (this.type === undefined || this.type.getAnimationName() !== val.getAnimationName())) {
      this.animationChangeCallback(val.getAnimationName());
    }
    this._type = val;
  }




  // TODO Stop repeatedly decrementing these and start storing step count instead
  tick() {
    this.lockedFor--;
    this.switchIn--;

    if (this.switchIn <= 0) {
      let switchTo = this.type.getNextAction();
      if (switchTo)
        this.setType(switchTo);
    }
  }

}

CreatureAction.registeredTypes = {};





// TODO Use some JS tricks to auto-generate all of the ugly getters/setters
class Type {
  constructor(creatureClass, name, id) {
    this.name = name;
    this.fullName = creatureClass.name + "." + name;
    this.setLockDuration(0);
    this.setNextAction(CreatureAction.Type.Idle);
    this.setActionLength(2);      // TODO re-consider; maybe use post-step to tick? If so, also do it in the input handling?
    this.setAnimationName(name);
    this.setUseInputMovement(false);
    this.setInputMovementSpeed(0.0);
    this.setFreezeDirection(true);

    if (id === undefined)
      id = Utils.hashStr(this.fullName);
    this.id = id;

    if (CreatureAction.registeredTypes[id]) {
        console.error("Type constructor: accidental override of type id " + id + " when registering type", this.fullName);
    }
    CreatureAction.registeredTypes[id] = this;
  }

  // no getter/setter because we might want to pass arguments one day
  getLockDuration() {
    return this.lockDuration;
  }
  setLockDuration(val) {
    this.lockDuration = val;
    return this;
  }

  getActionLength() {
    return this.actionLength;
  }
  setActionLength(val) {
    this.actionLength = val;
    return this;
  }

  getNextAction() {
    return this.nextAction;
  }
  setNextAction(val) {
    this.nextAction = val;
    return this;
  }


  getAnimationName() {
    return this.animationName;
  }
  setAnimationName(val) {
    this.animationName = val;
    return this;
  }

  getUseInputMovement() {
    return this.useInputMovement;
  }
  setUseInputMovement(val) {
    this.useInputMovement = val;
    return this;
  }

  getInputMovementSpeed() {
    return this.inputMovementSpeed;
  }
  setInputMovementSpeed(val) {
    this.inputMovementSpeed = val;
    return this;
  }

  getFreezeDirection() {
    return this.freezeDirection;
  }
  setFreezeDirection(val) {
    this.freezeDirection = val;
    return this;
  }

}

CreatureAction.Type = Type;

CreatureAction.Type.Idle = new CreatureAction.Type(Creature, 'idle').setUseInputMovement(true)
    .setNextAction(null)
    .setFreezeDirection(false);
CreatureAction.Type.Running = new CreatureAction.Type(Creature, 'running').setUseInputMovement(true)
    .setInputMovementSpeed(1.0)
    .setFreezeDirection(false);




require('../../../Utils/ClassLoader').registerClass(CreatureAction);
module.exports = CreatureAction;
