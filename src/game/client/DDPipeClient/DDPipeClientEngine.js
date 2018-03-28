'use strict';

import DDClientEngine from 'game/client/DDClientEngine';
import DDRenderer from 'game/client/DDRenderer';

const reversedToggleKeys = parseKeysObject(toggleKeys);
const reversedPushKeys = parseKeysObject(pushKeys);



class DDPipeClientEngine extends DDClientEngine {

  constructor(clientOptions) {
    super(clientOptions, DDRenderer.DummyRenderer);
  }




}



module.exports = DDPipeClientEngine;
