'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, '../client/index.html');
const STYLE = path.join(__dirname, '../client/style.css');
const BUNDLE = path.join(__dirname, '../../../dist/bundle.js');

const files = {
  '/': INDEX,
  '/index.html': INDEX,
  '/style.css': STYLE,
  '/dist/bundle.js': BUNDLE,
};

// define routes and socket
const server = express();

Object.keys(files).forEach(
  (key) => server.get(key, (req, res) => res.sendFile(files[key]))
);

server.use('/assets', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../../../assets' + req.path));
});

let requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
const io = socketIO(requestHandler);

// Game Server
const DDServerEngine = require(path.join(__dirname, '../../game/server/DDServerEngine.js'));
const DDGameEngine = require(path.join(__dirname, '../../game/common/DDGameEngine.js'));
const {physics: {SimplePhysicsEngine}} = require('lance-gg');

// Game Instances
const physicsEngine = new SimplePhysicsEngine();
const gameEngine = new DDGameEngine({ physicsEngine, traceLevel: 1 });
const serverEngine = new DDServerEngine(io, gameEngine, { debug: {}, updateRate: 6 });

// start the game
serverEngine.start();




class NodeServer {
  static getGameEngine() {
    return gameEngine;
  }

  static getPhysicsEngine() {
    return physicsEngine;
  }

  static getServerEngine() {
    return serverEngine;
  }
}

module.exports = NodeServer;
