'use strict';

require('./remoteConsole');

const DDRenderer = require('../../game/client/Rendering/DDRenderer');
const $ = require('jquery');
const {spawn} = require('child_process');
const NodeServer = require('../server/nodeServer.js');


require('../../game/common/Utils/SpriteLoader').setResourceDirectory('../../../');

let spriteLoaderPromise = require('../../game/client/ResourcePreloader').preload();
let buildServerPromise = buildServer();

onReady();

async function onReady() {
  await new Promise(resolve => $(resolve));   // wrapper promise for $.ready(...)

  $('#content').hide();
  let loadingLabel = $('.loadingLabel');

  loadingLabel.text("Loading sprites...");
  await spriteLoaderPromise;

  loadingLabel.text("Preparing server...");
  await buildServerPromise;

  loadingLabel.text("Finishing up...");
  let server = new NodeServer();
  server.start();
  let renderer = new DDRenderer(server.getGameEngine(), undefined, true);

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

  $(document).on('visibilitychange', function() {
    console.log("New visibility state: " + document.visibilityState);
  });

  $('#loading').remove();
  $('#content').show();
}






async function buildServer() {
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
