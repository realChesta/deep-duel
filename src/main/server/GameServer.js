'use strict';

const DDServerEngine = require('../../game/server/DDServerEngine.js');

class GameServer {

  constructor(io) {
    this.serverEngine = new DDServerEngine(io, { debug: {}, updateRate: 6 });
  }

  start() {
    this.getServerEngine().start();
  }

  getServerEngine() {
    return this.serverEngine;
  }

  getGameEngine() {
    return this.getServerEngine().gameEngine;
  }

  getPhysicsEngine() {
    return this.getGameEngine().physicsEngine;
  }

}

module.exports = GameServer;
