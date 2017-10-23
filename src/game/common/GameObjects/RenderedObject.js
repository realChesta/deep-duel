'use strict';

const {serialize: {DynamicObject}} = require('lance-gg');

/**
 * An abstract class for rendered dynamic objects. Implement the methods initRenderContainer(container) and drawSprite(container) for functionality.
 * For additional clean-up just before the render container is removed, implement onRenderContainerDestroy(container). initRenderContainer(...) will be called exactly once per onRenderContainerDestroy(...), and vice-versa.
 * Rendering functions will only be called client-side. When using client-side rendering libraries, be sure to require these inside of the rendering or another client-only function, as else they will also be loaded server-sided.
 */
class RenderedObject extends DynamicObject {

  constructor(id) {
    super(id);
    this.class = RenderedObject;
  }

  drawSprite(container) {
    console.warn("No draw function defined for " + this + "!");
  }
  initRenderContainer(container) {}
  onRenderContainerDestroy(container) {}
}

module.exports = RenderedObject;
