'use strict';

require('./remoteConsole');

import DDDefaultRenderer from 'game/client/DefaultClient/Rendering/DDDefaultRenderer';
const $ = require('jquery');
const {spawn} = require('child_process');
const NodeServer = require('main/server/nodeServer.js');


require('game/common/Utils/SpriteLoader').setResourceDirectory('../../../');

let spriteLoaderPromise = require('game/common/Utils/ResourcePreloader').preload();
let buildServerPromise = buildServer();
let server = undefined;

onReady();

async function onReady() {
  await new Promise(resolve => $(resolve));   // wrapper promise for $.ready(...)

  $('.startHidden').hide();
  let loadingLabel = $('.loadingLabel');

  loadingLabel.text("Loading sprites...");
  await spriteLoaderPromise;

  loadingLabel.text("Webpacking server...");
  await buildServerPromise;

  loadingLabel.text("Finishing up...");
  server = new NodeServer();
  server.start();

  $('#serversRefresh').click(refreshServerList);
  setInterval(refreshServerList, 1000);

  $('#loading').remove();
  $('.startHidden').show();
}


function refreshServerList() {
  let serverInfo = $('#serverInfo');
  let playersWaiting = $('#playersWaiting');
  let serversList = $('#serversList');


  let plw = server.matchmaker.playerQueue.map(s => document.createTextNode(s.conn.remoteAddress + " - " + s.conn.id));
  playersWaiting.empty();
  plw.forEach(p => {
    playersWaiting.append(p);
    playersWaiting.append($('<br>'));
  });

  let servers = Object.entries(server.serverEngines).map(s => {
    let uuid = s[1].uuid;
    let a = $('<a href="javascript:void(0)">');
    a.text(s[0]);
    a.click(() => showServer(uuid));
    return a;
  });
  serversList.empty();
  servers.forEach(a => {
    serversList.append(a);
    serversList.append($('<br>'));
  });
}


function showServer(uuid) {
  let renderer = new DDDefaultRenderer(server.getGameEngine(uuid), undefined, true);

  var view = renderer.getView();
  var gameRenderer = $('#gameRenderer');
  gameRenderer.empty();
  gameRenderer.append(view);
  gameRenderer.focus();
  gameRenderer.click((e) => gameRenderer.focus());
}





// TODO In the future, create a build UI server without this stuff
async function buildServer() {
  const name = "webpack (npm)";
  let process = spawn('npm', ['run-script', 'webpack'], {shell: true, windowsHide: true});

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
