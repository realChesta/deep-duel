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

// We already want to start loading some elements early, eg. so they can already register their sprites.
// We therefore simply need to require them, as this will call their code and they'll be able to set things up.
// Example: Player needs some assets loaded by SpriteLoader, so we already load the Player class which will also load these assets.
require("../game/common/GameObjects/Entities/Player");


let spriteLoaderPromise = require('../game/common/Utils/SpriteLoader').loadAll();

onReady();
async function onReady() {
  await new Promise(resolve => $(resolve));   // wrapper promise for $.ready(...)
  await spriteLoaderPromise;  // TODO Add a loading screen
  var view = clientEngine.renderer.getView();
  var gameRenderer = $('#gameRenderer');
  gameRenderer.append(view);
  clientEngine.addInputEvents(gameRenderer[0]);
  gameRenderer.focus();
  gameRenderer.click((e) => gameRenderer.focus());
  clientEngine.start();
}
