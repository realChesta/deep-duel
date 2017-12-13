'use strict';

const DeepDuel = require('../../game/common/DeepDuel');
const DDServerEngine = require('../../game/server/DDServerEngine');

DeepDuel.gameServers = [];

class GameServer {

  constructor(io) {
    this.serverEngine = new DDServerEngine(io, { debug: {}, updateRate: 6 });

    DeepDuel.gameServers.push(this);
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
