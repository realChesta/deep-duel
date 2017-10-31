'use strict';

const {physics: {SimplePhysicsEngine}} = require('lance-gg');
const DDServerEngine = require('../../game/server/DDServerEngine.js');
const DDGameEngine = require('../../game/common/DDGameEngine.js');

class GameServer {

  constructor(io) {
    this.physicsEngine = new SimplePhysicsEngine();
    this.gameEngine = new DDGameEngine({ physicsEngine });
    this.serverEngine = new DDServerEngine(io, gameEngine, { debug: {}, updateRate: 6 });
  }

  start() {
    serverEngine.start();
  }

  getGameEngine() {
    return this.gameEngine;
  }

  getPhysicsEngine() {
    return this.physicsEngine;
  }

  getServerEngine() {
    return this.serverEngine;
  }

}

module.exports = GameServer;
