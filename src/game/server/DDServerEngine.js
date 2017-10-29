'use strict';

const {ServerEngine} = require('lance-gg');

class DDServerEngine extends ServerEngine {

  constructor(io, gameEngine, inputOptions) {
    super(io, gameEngine, inputOptions);
  }

  start() {
    super.start();
  }

  onPlayerConnected(socket) {
    super.onPlayerConnected(socket);
    let playerId = this.gameEngine.world.playerCount;

    socket.on('keepAlive', (() => {
      let event = {playerId: playerId};
      this.gameEngine.emit('keepAlive', event);
    }).bind(this));
  }

  onPlayerDisconnected(socketId, playerId) {
    super.onPlayerDisconnected(socketId, playerId);
  }

}

module.exports = DDServerEngine;
