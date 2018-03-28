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
        if (Math.random() < 0.5) {
          const toggleKeys = ['up', 'down', 'left', 'right'];
          this.sendToggleKey(toggleKeys[Math.floor(Math.random() * toggleKeys.length)], Math.random() < 0.5);
        } else {
          const pushKeys = ['attack', 'fire', 'dash'];
          this.sendPushKey(pushKeys[Math.floor(Math.random() * pushKeys.length)]);
        }
      }, 200);
  }

}



module.exports = DDAIClientEngine;
