'use strict'

import ClientEngine from 'lance/ClientEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
const DDRenderer = require('./Rendering/DDRenderer');
const DDGameEngine = require('../common/DDGameEngine');

const toggleKeys = {
  'up': [38, 87],
  'down': [40, 83],
  'left': [37, 65],
  'right': [39, 68]
};

const pushKeys = {
  'attack': [32]
}

const reversedToggleKeys = parseKeysObject(toggleKeys);
const reversedPushKeys = parseKeysObject(pushKeys);

class DDClientEngine extends ClientEngine {

  constructor(clientOptions) {
    let options = DDClientEngine.getCustomizedOptions(clientOptions);
    super(new DDGameEngine(options), options, DDRenderer);

    this.gameEngine.on('preStep', this.preStep.bind(this));

    this.pressedKeys = {};
    for (let key of Object.keys(toggleKeys)) {
      this.pressedKeys[key] = false;
    }

  }


  static getCustomizedOptions(clientOptions) {
    const options = {
      delayInputCount: 3,
      clientIDSpace: 1000000,
      syncOptions: {
        sync: clientOptions.sync || 'extrapolate',
        localObjBending: 0.0,
        remoteObjBending: 0.8,
        bendingIncrements: 6
      }
    };

    /*if (options.syncOptions.sync === 'extrapolate')
      options.physicsEngine = new SimplePhysicsEngine();*/

    return Object.assign(options, clientOptions);
  }


  addInputEvents(to) {
    let that = this;
    to.onkeydown = (e) => {
      that.onKeyChange.call(that, e, true);
    };
    to.onkeyup = (e) => {
      that.onKeyChange.call(that, e, false);
    };
  }

  onKeyChange(e, isDown) {
    e = e || window.event;

    let preventDefault = false;

    if (reversedToggleKeys[e.keyCode]) {
      this.handleKeyChange(reversedToggleKeys[e.keyCode], isDown);
      preventDefault = true;
    }

    if (isDown && reversedPushKeys[e.keyCode]) {
      if (!e.repeat)
        this.sendInput(reversedPushKeys[e.keyCode], {});
      preventDefault = true;
    }

    if (preventDefault)
      e.preventDefault();
  }

  handleKeyChange(key, isDown) {
    if (this.pressedKeys[key] !== isDown) {
      this.pressedKeys[key] = isDown;
      this.sendInput(key, {isDown: isDown})
    }
  }

  preStep() {
    if (this.gameEngine.world.stepCount % 20 == 0) {
      // send keep alive packet
      this.broadcastEvent('keepAlive');
      // TODO Check if client input and server inputDirection match, if not, fix that
    }
  }


  get character() {
    return this.gameEngine.characters[this.playerId];
  }

  /**
   * Broadcasts a message with some data to the server and the game engine.
   * Other clients won't receive it by default
   */
  broadcastEvent(msg, data) {
    this.socket.emit('bc', {msg: msg, data: data});
    this.gameEngine.emit(msg, Object.assign({
      playerId: this.playerId
    }, data));
  }

}

function parseKeysObject(keys) {
  var keyDict = {};

  for (var action of Object.keys(keys)) {
    for (var key in keys[action]) {
      keyDict[keys[action][key]] = action;
    }
  }

  return keyDict;
}

module.exports = DDClientEngine;
