'use strict'

const {ClientEngine} = require('lance-gg');
const DDRenderer = require('./Rendering/DDRenderer');

const keys = {
  'up': [38, 87],
  'down': [40, 83],
  'left': [37, 65],
  'right': [39, 68],
  'fire': [32]
};

const reversedKeys = parseKeysObject(keys);

class DDClientEngine extends ClientEngine {

  constructor(gameEngine, options) {
    super(gameEngine, options, DDRenderer);

    this.gameEngine.on('preStep', this.preStep.bind(this));

    this.pressedKeys = {};
    for (let key of Object.keys(keys)) {
      this.pressedKeys[key] = false;
    }

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

    if (reversedKeys[e.keyCode]) {
      this.handleKeyChange(reversedKeys[e.keyCode], isDown);
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
      // TODO Check if client input and server Direction match, if not, fix that
    }
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

function parseKeysObject() {
  var keyDict = {};

  for (var action of Object.keys(keys)) {
    for (var key in keys[action]) {
      keyDict[keys[action][key]] = action;
    }
  }

  return keyDict;
}

module.exports = DDClientEngine;
