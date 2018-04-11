'use strict'

import ClientEngine from 'lance/ClientEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
import DDGameEngine from 'game/common/DDGameEngine';
import DDUtils from 'game/common/Utils/DDUtils';

class DDClientEngine extends ClientEngine {

  constructor(clientOptions, Renderer) {
    let options = DDClientEngine.getCustomizedOptions(clientOptions);
    super(new DDGameEngine(options), options, Renderer);

    this.gameEngine.on('preStep', this.preStep.bind(this));
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


  async connect() {
    await super.connect.apply(this, arguments);

    await DDUtils.socketMessage(this.socket, 'jpq', 'matchmakingFound');
    await DDUtils.socketMessage(this.socket, 'meReady', 'gameStarts');
  }

  preStep() {
    if (this.gameEngine.world.stepCount % 20 == 0) {
      // send keep alive packet
      this.broadcastEvent('keepAlive');
      // TODO Check if client input and server inputDirection match, if not, fix that
    }
  }


  sendPushKey(key) {
    this.sendInput(key, {});
  }

  sendToggleKey(key, isDown) {
    this.sendInput(key, {isDown: isDown});
  }



  get character() {
    return this.gameEngine.characters[this.gameEngine.playerId];
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

module.exports = DDClientEngine;
