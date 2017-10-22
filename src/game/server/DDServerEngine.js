'use strict';

const {ServerEngine} = require('lance-gg');

class DDServerEngine extends ServerEngine {

  constructor(io, gameEngine, inputOptions) {
    super(io, gameEngine, inputOptions);

      this.objectIdCur = 0;
      this.playerIdCur = 0;
    this.players = {};
  }

  start() {
    super.start();
  }

  onPlayerConnected(socket) {
    super.onPlayerConnected(socket);

    this.gameEngine.addPlayer();
  }

  onPlayerDisconnected(socketId, playerId) {
    super.onPlayerDisconnected(socketId, playerId);

    this.gameEngine.removePlayer(playerId);
  }

  addPlayer() {
    var object = new Player(++this.objectIdCur, 200, 200, ++this.playerIdCur);
    this.players[this.playerIdCur] = object;
    this.gameEngine.addObjectToWorld(object);
  }

  removePlayer(playerId) {
    if (!this.players[playerId])
      return;

    this.gameEngine.removeObjectFromWorld(this.players[playerId].id);
    delete this.players[playerId];
  }

}

module.exports = DDServerEngine;
