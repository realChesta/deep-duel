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

const parsedKeys = parseKeyJson(keys);

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

  // TODO: find a nice place to put the keys object and stop parsing it on every keystroke
  // TODO make each input packet smaller (they're not compressed)
  onKeyChange(e, isDown) {
    e = e || window.event;

    let preventDefault = true;

    if (parsedKeys[e.keyCode])
      this.handleKeyChange(parsedKeys[e.keyCode], isDown);

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
      this.socket.emit('keepAlive');      // TODO combine socket.emit and gameEngine.emit with an API
      this.gameEngine.emit('keepAlive', {playerId: this.playerId});
    }
  }


}

function parseKeyJson(json) {
  var keyDict = {};

  for (var action of Object.keys(json)) {
    for (var key in json[action]) {
      keyDict[json[action][key]] = action;
    }
  }

  return keyDict
}

module.exports = DDClientEngine;
