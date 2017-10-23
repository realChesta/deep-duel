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
  }

  onPlayerDisconnected(socketId, playerId) {
    super.onPlayerDisconnected(socketId, playerId);
  }

}

module.exports = DDServerEngine;
