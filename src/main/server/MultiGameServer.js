'use strict';

import DeepDuel from 'game/common/DeepDuel';
import DDServerEngine from 'game/server/DDServerEngine';
import socketIO from 'socket.io';
import uuidV4 from 'uuid/v4';
import Matchmaker from 'main/server/Matchmaker';

DeepDuel.multiGameServers = [];

class MultiGameServer {

  constructor(io) {
    this.serverEngines = {};
    this.io = io;
    this.matchmaker = null;

    DeepDuel.multiGameServers.push(this);
  }

  start() {
    this.matchmaker = new Matchmaker(this.io, this.startServer.bind(this));
  }

  createServer() {
    let uuid = uuidV4();

    if (this.serverEngines[uuid] !== undefined) {
      throw new Error("Tried creating a server engine on port " + uuid + " with that port already occupied!");
    }

    let serverEngine = this.serverEngines[uuid] = new DDServerEngine({on: () => {}}, { debug: {}, updateRate: 6 });
    serverEngine.io = this.io;
    serverEngine.uuid = uuid;

    console.log("Created new server engine with UUID " + uuid);
    return serverEngine;
  }

  removeServer(uuid) {
    let serverEngine = this.serverEngines[uuid];
    if (serverEngine === undefined) return;

    serverEngine.stop();
  }

  onServerStop(serverEngine) {
    let uuid = serverEngine.uuid;
    delete this.serverEngines[uuid];

    console.log("Removed server engine with UUID " + uuid);
  }

  startServer(playerSockets) {
    let serverEngine = this.createServer();
    serverEngine.onStop(() => this.onServerStop(serverEngine.uuid));
    serverEngine.start();
    playerSockets.forEach(s => {
      s.emit('gameStarts')
      serverEngine.onPlayerConnected(s)
    });
  }



  getServerEngine(uuid) {
    return this.serverEngines[uuid];
  }

  getGameEngine(uuid) {
    return (this.getServerEngine(uuid) || {}).gameEngine;
  }

  getPhysicsEngine(uuid) {
    return (this.getGameEngine(uuid) || {}).physicsEngine;
  }

}

module.exports = MultiGameServer;
