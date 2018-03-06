'use strict';

import ServerEngine from 'lance/ServerEngine';
const DDGameEngine = require('../common/DDGameEngine');

class DDServerEngine extends ServerEngine {

  constructor(io, inputOptions) {
    super(io, new DDGameEngine(), inputOptions);
  }

  start() {
    super.start();
  }

  onPlayerConnected(socket) {
    super.onPlayerConnected(socket);
    let playerId = socket.playerId;

    socket.on('bc', ((a) => {
      this.resetIdleTimeout(socket);
      let msg = a.msg;
      let data = Object.assign({
        playerId: playerId
      }, a.data);
      this.gameEngine.emit(msg, data);
    }).bind(this));
  }

  onPlayerDisconnected(socketId, playerId) {
    super.onPlayerDisconnected(socketId, playerId);
  }


  disconnectAllClients() {

  }

}

module.exports = DDServerEngine;
