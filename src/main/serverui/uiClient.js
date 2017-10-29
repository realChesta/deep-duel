'use strict';

require('./remoteConsole');

const DDRenderer = require('../../game/client/Rendering/DDRenderer');
const $ = require('jquery');
const {spawn} = require('child_process');


require('../../game/common/Utils/SpriteLoader').setResourceDirectory('../../../');

let spriteLoaderPromise = require('../../game/client/ResourcePreloader').preload();
let rebuildServerPromise = rebuildServer();

onReady();

async function onReady() {
  await new Promise(resolve => $(resolve));   // wrapper promise for $.ready(...)

  $('#content').hide();
  let loadingLabel = $('.loadingLabel');

  loadingLabel.text("Loading sprites...");
  await spriteLoaderPromise;  // TODO Add a loading screen

  loadingLabel.text("Preparing server...");
  await rebuildServerPromise;

  loadingLabel.text("Finishing up...");

  const NodeServer = require('../server/nodeServer.js');
  let renderer = new DDRenderer(NodeServer.getGameEngine());

  var view = renderer.getView();
  var gameRenderer = $('#gameRenderer');
  gameRenderer.append(view);
  gameRenderer.focus();
  gameRenderer.click((e) => gameRenderer.focus());

  var reloadAll = $('.reloadAll');
  reloadAll.click(function() {
    console.log("Restarting server...");
    location.reload(true);
  });

  $('#loading').remove();
  $('#content').show();
}






async function rebuildServer() {
  const name = "browserify (npm)";
  let process = spawn('npm', ['run-script', 'browserify'], {shell: true, windowsHide: true});

  process.stdout.on('data', (data) => {
    console.log(name + ": " + data);
  });

  process.stderr.on('data', (data) => {
    console.error(name + ": " + data);
  });

  return new Promise((resolve, fail) => {
    process.on('exit', (code) => {
      console.log(name + " exited with exit code " + code);
      if (code === 0) {
        resolve();
      } else {
        fail();
      }
    })
  });
}
