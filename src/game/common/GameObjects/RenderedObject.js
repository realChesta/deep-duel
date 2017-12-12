'use strict';

const {serialize: {DynamicObject}} = require('lance-gg');
const DDGameObject = require('./DDGameObject');

/**
 * An abstract class for rendered dynamic objects. Implement the methods
 * initRenderContainer(container) and drawSprite(container, debugLayer) for
 * functionality. debugLayer may be undefined.
 *
 * For additional clean-up just before the render container is removed,
 * implement onRenderContainerDestroy(container). initRenderContainer(...) will
 * be called exactly once per onRenderContainerDestroy(...), and vice-versa.
 *
 * Rendering functions will only be called client-side. When using client-side
 * rendering libraries, be sure to require these inside of the rendering or
 * another client-only function, as else they will also be loaded server-sided.
 */
class RenderedObject extends DDGameObject {

  constructor(id) {
    super(id);
  }

  tickSprite() {}
  drawSprite(container, debugLayer) {}
  initRenderContainer(container) {}
  onRenderContainerDestroy(container) {}
}

// TODO do we need class loader here?
module.exports = RenderedObject;
