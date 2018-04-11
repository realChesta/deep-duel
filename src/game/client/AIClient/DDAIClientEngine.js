'use strict';

import DDClientEngine from 'game/client/DDClientEngine';
import DDRenderer from 'game/client/DDRenderer';


class DDAIClientEngine extends DDClientEngine {

  constructor(clientOptions) {
    super(clientOptions, DDRenderer.DummyRenderer);
  }

  startRandomInputs() {
      setInterval(() => {
        if (!this.gameEngine.hasStarted) return;
        if (Math.random() < 0.95) {
          const toggleKeys = ['up', 'down', 'left', 'right', 'fire up', 'fire down', 'fire left', 'fire right'];
          this.sendToggleKey(toggleKeys[Math.floor(Math.random() * toggleKeys.length)], Math.random() < 0.5);
        } else {
          const pushKeys = ['attack', 'dash'];
          this.sendPushKey(pushKeys[Math.floor(Math.random() * pushKeys.length)]);
        }
      }, 50);
  }

}



module.exports = DDAIClientEngine;
