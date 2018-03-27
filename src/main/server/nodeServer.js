'use strict';

// TODO Test if creating multiple NodeServers on the same process (with different ports) works

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const GameServer = require('main/server/GameServer');

const DEFAULT_PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, '../client/index.html');
const STYLE = path.join(__dirname, '../client/style.css');
const BUNDLE = path.join(__dirname, '../../../dist/bundle.js');

const files = {
  '/': INDEX,
  '/index.html': INDEX,
  '/style.css': STYLE,
  '/dist/bundle.js': BUNDLE,
};

const server = express();

Object.keys(files).forEach(
  (key) => server.get(key, (req, res) => res.sendFile(files[key]))
);

server.use('/assets', function(req, res, next) {
  console.log("Responding to request from " + req.ip);
  res.sendFile(path.join(__dirname, '../../../assets' + req.path));
  // TODO Do we need next? If so, uncomment this: next();
});


function getIO(port) {
  if (!port) port = DEFAULT_PORT;

  let requestHandler = server.listen(port, () => console.log(`Listening on ${ port }`));
  return socketIO(requestHandler);
}


class NodeServer extends GameServer {
  constructor(port) {
    super(getIO(port));
  }
}



module.exports = NodeServer;
