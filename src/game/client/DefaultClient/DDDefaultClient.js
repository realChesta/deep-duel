'use strict';

import DDClientEngine from 'game/client/DDClientEngine';
import DDDefaultRenderer from './Rendering/DDDefaultRenderer';

const toggleKeys = {
  'up': [38, 87],
  'down': [40, 83],
  'left': [37, 65],
  'right': [39, 68]
};

const pushKeys = {
  'attack': [32],
  'fire': [16],
  'dash': [17]
}

const reversedToggleKeys = parseKeysObject(toggleKeys);
const reversedPushKeys = parseKeysObject(pushKeys);



class DDDefaultClient extends DDClientEngine {

  constructor(clientOptions) {
    super(clientOptions, DDDefaultRenderer);

    this.pressedKeys = {};
    for (let key of Object.keys(toggleKeys)) {
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

    if (reversedToggleKeys[e.keyCode]) {
      this.handleKeyChange(reversedToggleKeys[e.keyCode], isDown);
      preventDefault = true;
    }

    if (isDown && reversedPushKeys[e.keyCode]) {
      if (!e.repeat)
        this.sendPushKey(reversedPushKeys[e.keyCode]);
      preventDefault = true;
    }

    if (preventDefault)
      e.preventDefault();
  }

  handleKeyChange(key, isDown) {
    if (this.pressedKeys[key] !== isDown) {
      this.pressedKeys[key] = isDown;
      this.sendToggleKey(key, isDown);
    }
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




module.exports = DDDefaultClient;
