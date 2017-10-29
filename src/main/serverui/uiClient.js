'use strict';

const DDRenderer = require('../../game/client/Rendering/DDRenderer');
const NodeServer = require('../server/nodeServer.js');
const $ = require('jquery');
require('./remoteConsole');


require('../../game/common/Utils/SpriteLoader').setResourceDirectory('../../../');
let spriteLoaderPromise = require('../../game/client/ResourcePreloader').preload();
let renderer = new DDRenderer(NodeServer.getGameEngine());

onReady();
async function onReady() {
  await new Promise(resolve => $(resolve));   // wrapper promise for $.ready(...)
  await spriteLoaderPromise;  // TODO Add a loading screen
  var view = renderer.getView();
  var gameRenderer = $('#gameRenderer');
  gameRenderer.append(view);
  gameRenderer.focus();
  gameRenderer.click((e) => gameRenderer.focus());
}
