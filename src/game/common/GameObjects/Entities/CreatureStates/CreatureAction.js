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

    this.gameObject = gameObject;
    this.gameEngine = gameEngine;
    this._actionId = 0;
    // TODO HACK Maybe fix this - will need some ground-breaking lance-gg changes (right now, we need to not set type if gameObject is undefined because then this constructor is called as part of a sync step, and the object will be thrown away afterwards)
    if (gameObject !== undefined) {
      this.setType(CreatureAction.Type.Idle);
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
      if (this.prepareEnd()) {
        return false;
      }
      this.end();
    }

    this.forceSetType(val);
    this.lockedFor = this.getLockDuration();
    this.switchIn = this.getActionLength();
    this.startedAt = this.gameEngine.world.stepCount;
    this.hasNext = this.getHasNextAction();
    this._actionId++;
    this.start();
    return true;
  }

  getType() {
    // Convenience alias - put any logic into get type()
    return this.type;
  }

  forceSetType(val) {
    this._type = val;
  }

  get ticksPassed() {
    return this.gameEngine.world.stepCount - this.startedAt;
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
    let ticksPassed = this.ticksPassed;
    this.tick(ticksPassed);

    if (this.hasNext) {         // TODO Move into its own event handler that can be attached/detached separately
      if (ticksPassed >= this.switchIn) {
        let switchTo = this.getNextAction();
        if (switchTo)
          this.setType(switchTo);
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
    this.fullName = creatureClass.name + "." + name;    // TODO this is always undefined.name
    this.properties = Object.assign({}, Type.defaultProperties);
    this.setAnimationName(name);
    this.events = {};
    Object.keys(Type.defaultEvents).forEach((key) => this.events[key] = Type.defaultEvents[key].slice());


    if (id === undefined)
      id = Utils.hashStr(this.fullName);
    this.id = id;

    if (CreatureAction.registeredTypes[id]) {
        console.error("Type constructor: accidental override of type id " + id + " when registering type", this.fullName);
    }
    CreatureAction.registeredTypes[id] = this;
  }
}


Type.defaultProperties = {
  lockDuration: 0,      // TODO Does it make sense for lock durations to be slightly longer on clients to combat lag?
  hasNextAction: function() {return Boolean(this.getNextAction.call(this, arguments));},
  nextAction: null,
  actionLength: 2,
  animationName: null,
  useInputMovement: false,
  inputMovementSpeed: 0,
  freezeDirection: true,
  frictionMultiplier: 1
};

// Events that return a value that evaluates to true are cancelled. Not all events can be cancelled
// TODO Weak sets instead of an object?
Type.defaultEvents = {
  start: [],
  tick: [],
  prepareEnd: [function() {return this.ticksPassed < this.lockedFor;}],
  end: []
};


for (let property of Object.keys(Type.defaultProperties)) {
  let ud = upperd(property);

  setFunction(CreatureAction, 'get' + ud, function() {
    if (!this.type) return undefined;
    let val = this.type.properties[property];
    if (typeof val === 'function')
      return val.call(this);
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

Type.Idle = new Type(Creature, 'idle').setUseInputMovement(false)
    .setNextAction(null)
    .setFreezeDirection(false);
    Type.defaultProperties.nextAction = Type.Idle;
Type.Running = new Type(Creature, 'running').setUseInputMovement(true)
    .setInputMovementSpeed(1.0)
    .setFreezeDirection(false);


CreatureAction.Type = Type;




require('../../../Utils/ClassLoader').registerClass(CreatureAction);
module.exports = CreatureAction;
