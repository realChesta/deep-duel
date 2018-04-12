'use strict';

require('./remoteConsole');

import DDDefaultRenderer from 'game/client/DefaultClient/Rendering/DDDefaultRenderer';
const $ = require('jquery');
const {spawn} = require('child_process');
const NodeServer = require('main/server/nodeServer.js');
const mainProcess = require('electron').remote.process;
import DeepDuel from 'game/common/DeepDuel';


require('game/common/Utils/SpriteLoader').setResourceDirectory('../../../');

let spriteLoaderPromise = require('game/common/Utils/ResourcePreloader').preload();
let buildServerPromise = buildServer();
let server = undefined;
let aiID = 0;
let ais = [];

window.DeepDuel = DeepDuel;

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

  $(window).on('unload', () => ais.forEach(ai => {
    ai.kill();    // TODO This doesn't seem to clean-up the node process, only the npm process.
                  // The other invokation of .kill when clicking the Remove button works. Maybe
                  // we need to use spawn from the main process?
    console.log("Killed " + ai.customName);
  }));
  $('#startAI').click(startAI);

  $('#loading').remove();
  $('.startHidden').show();
}




function refreshAIList() {
  let aisRunning = $('#aisRunning');

  let aisn = [];
  for (let i = 0; i < ais.length; i++) {
    let b = $('<button style="margin-left: 15px;">Remove</button>');
    b.click(() => ais[i].kill());
    aisn[i] = [document.createTextNode(ais[i].customName), b];
  }
  aisRunning.empty();
  aisn.forEach(ai => {
    aisRunning.append(ai[0]);
    aisRunning.append(ai[1]);
    aisRunning.append($('<br>'));
  });
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

    let b = $('<button style="margin-left: 15px;">Remove</button>');
    b.click(() => {
      server.removeServer(uuid);
      refreshServerList();
    });
    return [a, b];

  });
  serversList.empty();
  servers.forEach(a => {
    serversList.append(a[0]);
    serversList.append(a[1]);
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
  let serverUUID = $('#serverUUID');
  serverUUID.text(uuid);
}





async function buildServer() {
  if (mainProcess.argv.indexOf('--no-webpack-option') >= 0)
    return;

  return await waitFor(runProcess("webpack (npm)", 'npm', ['run-script', 'webpack'], {shell: true, windowsHide: true}));
}

function startAI() {
  let process = runProcess("AI #" + aiID++, 'npm', ['run-script', 'ai'], {shell: true, windowsHide: true});

  process.on('exit', (data) => {
    let index = ais.indexOf(process);
    if (index >= 0) {
      ais.splice(index, 1);
      refreshAIList();
    }
  });

  let index = ais.push(process);
  refreshAIList();
  return process;
}



function runProcess(name, ...processOptions) {
  let process = spawn.apply(undefined, processOptions);

  process.customName = name;

  process.stdout.on('data', (data) => {
    console.log(name + ": " + data);
  });

  process.stderr.on('data', (data) => {
    console.error(name + ": " + data);
  });

  return process;
}

async function waitFor(process) {
  return await new Promise((resolve, fail) => {
    process.on('exit', (code) => {
      console.log(name + " exited with exit code " + code);
      if (code === 0) {
        resolve();
      } else {
        fail(code);
      }
    })
  });
}
