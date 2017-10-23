const {ClientEngine} = require('lance-gg');
const DDRenderer = require('./Rendering/DDRenderer');

class DDClientEngine extends ClientEngine {

  constructor(gameEngine, options) {
    super(gameEngine, options, DDRenderer);

    this.gameEngine.on('client__preStep', this.preStep.bind(this));
    this.gameEngine.on('objectAdded', this.renderer.addRenderedObject.bind(this.renderer));
    this.gameEngine.on('objectDestroyed', this.renderer.removeRenderedObject.bind(this.renderer));

    // keep a reference for key press state
    this.pressedKeys = {
      down: false,
      up: false,
      left: false,
      right: false,
      space: false
    };

    let that = this;
    document.onkeydown = (e) => {
      that.onKeyChange(e, true);
    };
    document.onkeyup = (e) => {
      that.onKeyChange(e, false);
    };
  }

  // our pre-step is to process all inputs
  preStep() {

    if (this.pressedKeys.up) {
      if (!this.pressedKeys.down)       // if both buttons are pressed, don't send anything
        this.sendInput('up', {movement: true});
    }
    else if (this.pressedKeys.down) {
      this.sendInput('down', {movement: true});
    }

    if (this.pressedKeys.left) {
      if (!this.pressedKeys.right)
        this.sendInput('left', {movement: true});
    }
    else if (this.pressedKeys.right) {
      this.sendInput('right', {movement: true});
    }

    if (this.pressedKeys.space) {
      this.sendInput('fire', {movement: false});
    }

  }

  onKeyChange(e, isDown) {
    e = e || window.event;

    if (e.keyCode == '38' || e.keyCode == '87') {
      this.pressedKeys.up = isDown;
    }
    else if (e.keyCode == '40' || e.keyCode == '83') {
      this.pressedKeys.down = isDown;
    }
    else if (e.keyCode == '37' || e.keyCode == '65') {
      this.pressedKeys.left = isDown;
    }
    else if (e.keyCode == '39' || e.keyCode == '68') {
      this.pressedKeys.right = isDown;
    }
    else if (e.keyCode == '32') {
      this.pressedKeys.space = isDown;
    }
  }
}

module.exports = DDClientEngine;
