'use strict';

const {serialize: {Serializable}} = require('lance-gg');
const Utils = require('lance-gg/src/lib/Utils');
const Creature = require('../Creature');

class CreatureAction extends Serializable {

  static get netScheme() {
    return Object.assign({
      typeId: {type: Serializer.TYPES.INT32},
      lockedFor: {type: Serializer.TYPES.INT32},
      switchIn: {type: Serializer.TYPES.INT32},
      switchToId: {type: Serializer.TYPES.INT32},
    }, super.netScheme);
  }

  syncTo(other) {
    this.type = other.type;
  }

  constructor(animationChangeCallback) {
    super();
    this.animationChangeCallback = animationChangeCallback;
    this.lockedFor = 0;
    this.switchIn = 0;
    this.switchTo = null;
    this.setType(CreatureAction.Type.Idle);
  }

  get typeId() {
    return this.type.id;
  }

  set typeId(val) {
    this.type = CreatureAction.registeredTypes[val];
  }

  get switchToId() {
    return this.switchTo.id;
  }

  set switchToId(val) {
    this.switchTo = CreatureAction.registeredTypes[val];
  }




  get type() {
    return this._type;
  }

  setType(val) {
    if (this.lockedFor > 0)
      return false;

    this.lockedFor = val.getLockDuration();
    this.switchIn = val.getActionLength();
    this.switchTo = val.getNextAction();
    if (this.type !== undefined && this.type.animationName !== val.animationName) {
      this.animationChangeCallback(val.animationName);
    }
    this._type = val;
    return true;
  }


  // TODO Stop repeatedly decrementing these and start storing step count instead
  tick() {
    this.lockedFor--;
    this.switchIn--;

    if (this.switchTo && this.switchIn <= 0) {
      let switchTo = this.switchTo;
      this.switchTo = null;
      this.setType(switchTo);
    }
  }

}

CreatureAction.registeredTypes = {};






class Type {
  constructor(creatureClass, name, id) {
    this.name = this.animationName = name;
    this.fullName = creatureClass + "." + name;
    this.setLockDuration(0);
    this.setNextAction(null);
    this.setActionLength(0);

    if (id === undefined)
      id = Utils.hashStr(this.fullName);
    this.id = id;

    if (CreatureAction.registeredTypes[id]) {
        console.error("Type constructor: accidental override of type id ${id} when registering type", classObj);
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

}

CreatureAction.Type = Type;

CreatureAction.Type.Idle = new CreatureAction.Type(Creature, 'idle');
CreatureAction.Type.Running = new CreatureAction.Type(Creature, 'running');




require('../../../Utils/ClassLoader').registerClass(CreatureAction);
module.exports = CreatureAction;
