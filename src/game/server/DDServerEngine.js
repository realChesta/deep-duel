'use strict';

import ServerEngine from 'lance/ServerEngine';
const DDGameEngine = require('../common/DDGameEngine');

class DDServerEngine extends ServerEngine {

  constructor(io, inputOptions) {
    super(io, new DDGameEngine(), inputOptions);
    this.stopHandlers = [];
    this.io = io;
  }

  start() {
    super.start();
  }

  onPlayerConnected(socket) {
    // TODO Only allow players to play that are actually playing

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

  onStop(handler) {
    this.stopHandlers.push(handler);
  }

  stop() {
    if (super.stop) super.stop.apply(this, arguments);

    this.stopHandlers.forEach(s => s(this));

    this.disconnectAllClients();
    this.gameEngine.timer.destroy();
    this.io.server.close();
  }

  disconnectAllClients() {
    if (super.disconnectAllClients) super.disconnectAllClients.apply(this, arguments);
    Object.values(this.connectedPlayers).forEach(p => {
      console.log(p.socket);
      p.socket.disconnect(true);
    });
  }

}

module.exports = DDServerEngine;
