const {ClientEngine} = require('lance-gg');
const DDRenderer = require('./Rendering/DDRenderer');

class DDClientEngine extends ClientEngine {

  constructor(gameEngine, options) {
    super(gameEngine, options, DDRenderer);

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

    var preventDefault = true;
    if (e.keyCode == '38' || e.keyCode == '87') {
      this.sendInput('up', {isDown: isDown});
    }
    else if (e.keyCode == '40' || e.keyCode == '83') {
      this.sendInput('down', {isDown: isDown});
    }
    else if (e.keyCode == '37' || e.keyCode == '65') {
      this.sendInput('left', {isDown: isDown});
    }
    else if (e.keyCode == '39' || e.keyCode == '68') {
      this.sendInput('right', {isDown: isDown});
    }
    else if (e.keyCode == '32') {
      this.sendInput('fire', {isDown: isDown});
    }
    else {
      preventDefault = false;
    }

    if (preventDefault)
      e.preventDefault();

  }
}

module.exports = DDClientEngine;
