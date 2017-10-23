const qsOptions = require('query-string').parse(location.search);
const DDClientEngine = require('../game/client/DDClientEngine');
const DDGameEngine = require('../game/common/DDGameEngine');
const {physics: {SimplePhysicsEngine}} = require('lance-gg');
const $ = require('jquery');


// default options, overwritten by query-string options
// is sent to both game engine and client engine
const defaults = {
  traceLevel: 1,
  delayInputCount: 3,
  clientIDSpace: 1000000,
  syncOptions: {
    sync: qsOptions.sync || 'extrapolate',
    localObjBending: 0.0,
    remoteObjBending: 0.8,
    bendingIncrements: 6
  }
};
let options = Object.assign(defaults, qsOptions);

// extrapolate mode requires a physics engine on the client
if (options.syncOptions.sync === 'extrapolate')
  options.physicsEngine = new SimplePhysicsEngine();

// create a client engine and a game engine
const gameEngine = new DDGameEngine(options);
const clientEngine = new DDClientEngine(gameEngine, options);


$().ready(function () {
  clientEngine.renderer.load(function () {    // TODO Add a loading screen
    var view = clientEngine.renderer.getView();
    var gameRenderer = $('#gameRenderer');
    gameRenderer.append(view);
    clientEngine.addInputEvents(document);    // TODO Replace document with gameRenderer
    gameRenderer.focus();
    gameRenderer.click((e) => gameRenderer.focus());
    clientEngine.start();
  });
});
