'use strict';

const NodePatches = require('./NodePatches');
const NodeServer = require('./NodeServer');

let server = new NodeServer();
server.start();

NodePatches.initInteractiveServerConsole();
