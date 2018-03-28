'use strict';

import Serializer from 'lance/serialize/Serializer';
import Serializable from 'lance/serialize/Serializable';
import Utils from 'lance/lib/Utils';
const Creature = require('../Creature');

class CreatureAction extends Serializable {

  static get netScheme() {
    return Object.assign({
      typeId: {type: Serializer.TYPES.INT32},
      lockedFor: {type: Serializer.TYPES.INT32},
      switchIn: {type: Serializer.TYPES.INT32},
      startedAt: {type: Serializer.TYPES.INT32},
      hasNext: {type: Serializer.TYPES.INT8},
      _actionId: {type: Serializer.TYPES.INT32}
    }, super.netScheme);
  }

  syncTo(other) {
    super.syncTo(other);

    this.forceSetType(other.type);
    this.lockedFor = other.lockedFor;   // TODO remove lockedFor and switchIn, call them every time from the type
    this.switchIn = other.switchIn;
    this.startedAt = other.startedAt;
    this.hasNext = other.hasNext;
    this._actionId = other._actionId;
  }

  constructor(gameObject, gameEngine) {
    super();

    // TODO HACK Check if lance-gg created this as part of a sync step. If so, set params to undefined
    if (gameObject === null) {
      gameObject = undefined;
      gameEngine = undefined;
    }

    this.gameObject = gameObject;
    this.gameEngine = gameEngine;
    this._actionId = 0;
    // TODO HACK Maybe fix this - will need some ground-breaking lance-gg changes (right now, we need to not set type if gameObject is undefined because then this constructor is called as part of a sync step, and the object will be thrown away afterwards)
    if (gameObject !== undefined) {
      this.setType(gameObject.actionTypes.Spawn || gameObject.actionTypes.Idle);
    }
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
    if (this.type !== undefined) {
      if (this.prepareEnd(val)) {
        return false;
      }
      this.end();
    }

    this.forceSetType(val);
    this.lockedFor = this.getLockDuration();
    this.switchIn = this.getActionLength();
    this.startedAt = this.stepCount();
    this.hasNext = this.getHasNextAction();
    this._actionId++;
    this.start();
    return true;
  }

  stepCount() {
    return this.gameEngine.world.stepCount;
  }

  getType() {
    // Convenience alias - put any logic into get type()
    return this.type;
  }

  forceSetType(val) {
    this._type = val;
  }

  get ticksPassed() {
    return this.stepCount() - this.startedAt;
  }


  /**
   * IMPORTANT Action data may be completely different on client and server.
   * Never assume it is valid on a client. Even with completely crippled action
   * data, a client must still work properly, even if the client-side prediction
   * may be off. Do never, ever, sync this or any data generated from this back
   * to the server
   */
  get actionData() {
    if (this._lastActionId === undefined || this._lastActionId < this._actionId) {
      this._actionData = {};
    }
    this._lastActionId = this._actionId;
    return this._actionData;
  }


  doTick() {
    this.tick(this.ticksPassed);

    if (this.hasNext) {         // TODO Move into its own event handler that can be attached/detached separately
      let i = 0;
      while (this.ticksPassed >= this.switchIn) {
        if (i++ >= 100000)
          throw new Error("More than 100 000 recursive action calls - are you sure there's no infinity loop? (Use .nextAction(null) to disabled next action). Next action: " + switchTo.fullName);

        let switchTo = this.getNextAction();
        if (!switchTo || null === switchTo) break;
        if (switchTo)
          if (!this.setType(switchTo)) break;
      }
    }
  }

}

CreatureAction.registeredTypes = {};



function upperd(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}



class Type {
  constructor(creatureClass, name, id) {
    this.name = name;
    this.fullName = creatureClass.name + "." + name;    // TODO this is always undefined.name right now
    this.creatureClass = creatureClass;
    this.properties = Object.assign({}, Type.defaultProperties);
    this.setAnimationName(name);
    this.events = {};
    Object.keys(Type.defaultEvents).forEach((key) => this.events[key] = Type.defaultEvents[key].slice());


    if (id === undefined)
      id = Utils.hashStr(this.fullName);
    this.id = id;

    if (CreatureAction.registeredTypes[id]) {
        console.error("Type constructor: accidental override of type id " + id + " when registering type", this.fullName);
    } else {
      CreatureAction.registeredTypes[id] = this;
    }
  }

  clone(creatureClass, newId) {
    if (newId === undefined) throw new Error("ID of cloned object is undefined; please set to either string or number");

    if (typeof newId !== 'number') {
      newId = Utils.hashStr(this.fullName + "_k_" + newId);
    }


    let obj = new Type(creatureClass, this.name, newId);
    obj.properties = Object.assign({}, this.properties);
    obj.events = Object.assign({}, this.events);
    return obj;
  }
}


Type.defaultProperties = {
  lockDuration: 0,      // TODO Does it make sense for lock durations to be slightly longer on clients to combat lag?
  hasNextAction: function() {return Boolean(this.getNextAction.call(this, arguments));},
  nextAction: function() {return this.gameObject.actionTypes.Idle;},
  actionLength: 2,
  animationName: null,
  useInputMovement: false,
  inputMovementSpeed: 0,
  freezeDirection: true,
  frictionMultiplier: 1,
  isDamageable: true,
  forceTypeChange: false
};

// Events that return a value that evaluates to true are cancelled. Not all events can be cancelled
// TODO Weak sets instead of an object?
Type.defaultEvents = {
  start: [],
  tick: [],
  prepareEnd: [function(nextActionType) {return !nextActionType.getForceTypeChange(this) && this.ticksPassed < this.lockedFor;}],
  end: []
};


for (let property of Object.keys(Type.defaultProperties)) {
  let ud = upperd(property);

  setFunction(CreatureAction, 'get' + ud, function() {
    if (!this.type) return undefined;
    return this.type['get' + ud].call(this.type, this);
  });

  setFunction(Type, 'get' + ud, function(action) {
    let val = this.properties[property];
    if (typeof val === 'function')
      return val.call(action);
    return val;
  });

  setFunction(Type, 'set' + ud, function(val) {
    this.properties[property] = val;
    return this;
  });
}


for (let event of Object.keys(Type.defaultEvents)) {
  let ud = upperd(event);

  setFunction(CreatureAction, event, function() {
    let cancelled = false;
    this.type.events[event].forEach((func) => {
      if (func.apply(this, arguments))
        cancelled = true;
    });
    return cancelled;
  });

  setFunction(Type, 'on' + ud, function(handler) {
    this.events[event].push(handler);
    return this;
  });
}


function setFunction(cl, name, func) {
  if (cl.prototype[name] !== undefined) {
    console.warn("Overriding " + name + " of a class with a custom function!", cl);
  }
  cl.prototype[name] = func;
}

Type.Idle = new Type(Creature, 'idle')
    .setUseInputMovement(false)
    .setNextAction(null)
    .setFreezeDirection(false);
Type.Running = new Type(Creature, 'running')
    .setUseInputMovement(true)
    .setInputMovementSpeed(1.0)
    .setFreezeDirection(false);
Type.Dead = new Type(Creature, 'dead')
    .setIsDamageable(false)
    .setForceTypeChange(true)
Type.Spawn = new Type(Creature, 'spawn')
    .setActionLength(0)
    .setLockDuration(0)
    .setNextAction(function() { return this.gameObject.actionTypes.Idle; })

CreatureAction.Type = Type;




require('../../../Utils/ClassLoader').registerClass(CreatureAction);
module.exports = CreatureAction;
