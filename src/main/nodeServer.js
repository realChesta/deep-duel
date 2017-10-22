'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, './index.html');
const BUNDLE = path.join(__dirname, '../../dist/bundle.js');

const files = {
  '/': INDEX,
  '/index.html': INDEX,
  '/dist/bundle.js': BUNDLE
};

// define routes and socket
const server = express();
Object.keys(files).forEach(
  (key) => server.get(key, (req, res) => res.sendFile(files[key]))
);
let requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
const io = socketIO(requestHandler);

// Game Server
const DDServerEngine = require(path.join(__dirname, '../game/server/DDServerEngine.js'));
const DDGameEngine = require(path.join(__dirname, '../game/common/DDGameEngine.js'));
const {physics: {SimplePhysicsEngine}} = require('lance-gg');

// Game Instances
const physicsEngine = new SimplePhysicsEngine();
const gameEngine = new DDGameEngine({ physicsEngine, traceLevel: 1 });
const serverEngine = new DDServerEngine(io, gameEngine, { debug: {}, updateRate: 6 });

// start the game
serverEngine.start();
