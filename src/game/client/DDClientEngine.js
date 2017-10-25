'use strict'

const {ClientEngine} = require('lance-gg');
const DDRenderer = require('./Rendering/DDRenderer');
const RenderedObject = require('../common/GameObjects/RenderedObject');

class DDClientEngine extends ClientEngine {

  constructor(gameEngine, options) {
    super(gameEngine, options, DDRenderer);

    this.gameEngine.on('objectAdded', this.onObjectAdded.bind(this));
    this.gameEngine.on('objectDestroyed', this.onObjectDestroyed.bind(this));
    this.gameEngine.on('preStep', this.preStep.bind(this));

    // keep a reference for key press state
    this.pressedKeys = {
      down: false,
      up: false,
      left: false,
      right: false,
      fire: false
    };

  }

  onObjectAdded(object) {
    if (object instanceof RenderedObject)
      this.renderer.addRenderedObject(object);
  }

  onObjectDestroyed(object) {
    if (object instanceof RenderedObject)
      this.renderer.removeRenderedObject(object);
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

  // TODO make each input packet smaller (they're not compressed)
  onKeyChange(e, isDown) {
    e = e || window.event;

    let preventDefault = true;

    switch (e.keyCode) {
      case '38':
      case '87':
        this.handleKeyChange('up', isDown);
        break;

      case '40':
      case '83':
        this.handleKeyChange('down', isDown);
        break;

      case '37':
      case '65':
        this.handleKeyChange('left', isDown);
        break;

      case '39':
      case '68':
        this.handleKeyChange('right', isDown);
        break;

      case '32':
        this.handleKeyChange('fire', isDown);
        break;

      default:
        preventDefault = false;
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

  preStep() {   // TODO Only fire this occasionally, based on lag
    for (let key of Object.keys(this.pressedKeys)) {
      if (this.pressedKeys[key]) {
        this.sendInput(key, {isDown: true});
      }
    }
  }
}

module.exports = DDClientEngine;
