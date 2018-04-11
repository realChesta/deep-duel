'use strict';

// TODO Test if creating multiple NodeServers on the same process (with different ports) works

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const MultiGameServer = require('main/server/MultiGameServer');

const DEFAULT_PORT = process.env.PORT || 3000;
const GAMESERVER_PORT_RANGE_START = 49153;
const GAMESERVER_PORT_RANGE_END = 52153;
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
  res.sendFile(path.join(__dirname, '../../../assets' + req.path));
  // TODO Do we need next? If so, uncomment this: next();
});


function getIO(port) {
  if (!port) port = DEFAULT_PORT;

  let requestHandler = server.listen(port, () => console.log(`Listening on ${ port }`));
  return socketIO(requestHandler);
}


class NodeServer extends MultiGameServer {
  constructor() {
    super(getIO(DEFAULT_PORT));
  }
}



module.exports = NodeServer;
