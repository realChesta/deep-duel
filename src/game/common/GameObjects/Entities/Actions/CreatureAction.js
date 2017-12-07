'use strict';

const {serialize: {Serializable, Serializer}} = require('lance-gg');
const Utils = require('lance-gg/src/lib/Utils');
const Creature = require('../Creature');

class CreatureAction extends Serializable {

  static get netScheme() {
    return Object.assign({
      typeId: {type: Serializer.TYPES.INT32},
      lockedFor: {type: Serializer.TYPES.INT32},
      switchIn: {type: Serializer.TYPES.INT32},
      hasNext: {type: Serializer.TYPES.INT8}
    }, super.netScheme);
  }

  syncTo(other) {
    super.syncTo(other);

    this.forceSetType(other.type);
    this.lockedFor = other.lockedFor;
    this.switchIn = other.switchIn;
  }

  constructor(gameObject) {
    super();

    this.gameObject = gameObject;
    this.animationChangeCallback = gameObject ? (actionName) => gameObject.onAnimationChange(actionName, undefined) : undefined;
    // HACK Maybe fix this - will need some ground-breaking lance-gg changes (right now, we need to not set type if gameObject is undefined because then it is called as part of a sync step)
    if (gameObject !== undefined)
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
    if (this.type !== undefined) {
      if (this.prepareEnd()) {
        return false;
      }
      this.end();
    }

    this.forceSetType(val);
    this.lockedFor = this.getLockDuration();
    this.switchIn = this.getActionLength();
    this.hasNext = this.getHasNextAction();
    this.start();
    return true;
  }

  forceSetType(val) {
    let oldan = this.getAnimationName();
    this._type = val;
    let newan = this.getAnimationName();
    // TODO Consider moving this to some kind of "visual change" event that can also be called by the type on occasion. Also there are like 34987645968943769843576 hypothetical bugs this way
    if (this.animationChangeCallback !== undefined && newan !== oldan) {
      this.animationChangeCallback(newan);
    }
  }




  // TODO Stop repeatedly decrementing these and start storing step count instead
  tick() {
    this.lockedFor--;

    if (this.hasNext) {
      this.switchIn--;
      if (this.switchIn <= 0) {
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
    this.fullName = creatureClass.name + "." + name;
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
  lockDuration: 0,
  hasNextAction: function() {return Boolean(this.getNextAction.call(this, arguments));},
  nextAction: null,
  actionLength: 2,
  animationName: null,
  useInputMovement: false,
  inputMovementSpeed: 0,
  freezeDirection: true
};

// Events that return a value that evaluates to true are cancelled. Not all events can be cancelled
// TODO Weak sets instead of arrays?
Type.defaultEvents = {
  start: [],
  prepareEnd: [function() {return this.lockedFor > 0}],
  end: []
};


// TODO Check if the methods we're registering for events and properties aren't already set
for (let property of Object.keys(Type.defaultProperties)) {
  let ud = upperd(property);

  CreatureAction.prototype['get' + ud] = function() {
    if (!this.type) return undefined;
    let val = this.type.properties[property];
    if (typeof val === 'function')
      return val.call(this);
    return val;
  };

  Type.prototype['set' + ud] = function(val) {
    this.properties[property] = val;
    return this;
  };
}


for (let event of Object.keys(Type.defaultEvents)) {
  let ud = upperd(event);

  CreatureAction.prototype[event] = function() {
    let cancelled = false;
    this.type.events[event].forEach((func) => {
      if (func.apply(this, arguments))
        cancelled = true;
    });
    return cancelled;
  };

  Type.prototype['on' + ud] = function(handler) {
    this.events[event].push(handler);
    return this;
  };
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
