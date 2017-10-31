const DDClientEngine = require('../../game/client/DDClientEngine');
const DDGameEngine = require('../../game/common/DDGameEngine');
const {physics: {SimplePhysicsEngine}} = require('lance-gg');
const $ = require('jquery');

const qsOptions = require('query-string').parse(location.search);
let clientEngine = new DDClientEngine(qsOptions);


let spriteLoaderPromise = require("../../game/client/ResourcePreloader").preload();


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
