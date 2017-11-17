const DDClientEngine = require('../../game/client/DDClientEngine');
const DDGameEngine = require('../../game/common/DDGameEngine');
const SpriteLoader = require('../../game/common/Utils/SpriteLoader');
const {physics: {SimplePhysicsEngine}} = require('lance-gg');
const $ = require('jquery');

const qsOptions = require('query-string').parse(location.search);
let clientEngine = new DDClientEngine(qsOptions);

// Dummy resources for testing the loading screen. Cross-origin requests must be allowed in browser
//require("pixi.js").loader.add('https://www.hq.nasa.gov/alsj/a17/A17_FlightPlan.pdf');
//require("pixi.js").loader.add('http://www.flam3.com/flame.pdf');
let spriteLoaderPromise = require('../../game/client/ResourcePreloader').preload();
SpriteLoader.onProgress(onSpriteLoadProgress);


let isReady = false;
onReady();
async function onReady() {
  await new Promise(resolve => $(resolve));   // wrapper promise for $.ready(...)
  isReady = true;
  await spriteLoaderPromise;

  var view = clientEngine.renderer.getView();
  var loadingBar = $('.loadingBar');
  loadingBar.fadeOut(750);
  console.log(loadingBar);
  var gameRenderer = $('#gameRenderer');
  $(view).hide();
  gameRenderer.prepend(view);
  $(view).fadeIn(250);
  clientEngine.addInputEvents(gameRenderer[0]);
  gameRenderer.focus();
  gameRenderer.click((e) => gameRenderer.focus());
  clientEngine.start();
}



function onSpriteLoadProgress(value, max) {
  if (isReady) {
    $('.loadingBar .fill').width(100 * value / max + '%');
  }
}
