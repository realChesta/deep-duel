'use strict';

const url = require('url');
import TwoVector from 'lance/serialize/TwoVector';

// The SpriteLoader exists on both client and server, but only actually loads something on some implementations of the former.
class SpriteLoader {


  /*
   * There are three kinds of loadable resources; asset collections
   * (MultiSprites), spritesheets (PIXI.extra.AnimatedSprites) and textures
   * (single frames/PIXI.Textures).
   *
   * Each asset collection consists out of multiple stylesheets, and each
   * stylesheet consists of multiple textures.
   *
   * While passing a spritesheet JSON into the PIXI.loader, it already converts
   * it into a bunch of textures automatically, we have to do it manually for
   * asset collections. Taking the player as an example, player.json is the
   * asset collection JSON, player_idle_left.json is a spritesheet JSON and each
   * one of the tiles in playeR_idle_left.png is a texture.
   *
   * We use PIXI's loader for all three "stages" of resources, but manually
   * extend it using middleware functions (to handle assets).
   */


  static add(path) {
    let assetsId = SpriteLoader.currentId++;
    SpriteLoader.toLoad[assetsId] = path;
    return assetsId;
  }

  static setResourceDirectory(dir) {
    SpriteLoader.resourceDirectory = dir;
  }


  static async loadAll() {
    const PIXI = require('pixi.js');

    // Add all the sprites to the PIXI loader
    let toL = Object.keys(SpriteLoader.toLoad);
    for (let name of toL) {
      PIXI.loader.add(name, SpriteLoader.resourceDirectory + SpriteLoader.toLoad[name], SpriteLoader.onResourceLoaded);
    }

    // Initialize Pixi's loader to use custom middleware functions (if it wasn't already)
    if (!SpriteLoader.inittedLoader) {
      PIXI.loader.use(SpriteLoader.useLoadedAssetCollection);     // runs after a resource was loaded, but before the .resourceLoaded callback
      PIXI.loader.onProgress.add((loader, resource) => this.progress(loader.progress, 100));
      SpriteLoader.inittedLoader = true;
    }

    // Actually start loading now. We don't want a callback, rather await syntax so we wrap it in a Promise
    await new Promise((resolve) => {
      PIXI.loader.load(() => resolve());
    });

    SpriteLoader.toLoad = {};
  }


  static getAssetCollection(name) {
    return SpriteLoader.loadedAssets[name];
  }

  static getSpritesheet(name) {
    return SpriteLoader.loadedSpritesheets[name];
  }


  static onResourceLoaded(resource) {
    if (resource.extension === 'json' && resource.data && (resource.data.type === 'asset' || resource.data.ddtype === 'charasset'))
      SpriteLoader.loadedAssets[resource.name] = SpriteLoader.generateAssetCollection(resource);
    else if (resource.extension === 'json' && resource.data && (resource.data.frames || resource.data.ddtype === 'spritesheet'))
      SpriteLoader.loadedSpritesheets[resource.name] = SpriteLoader.generateSpritesheet(resource);
  }

  static generateAssetCollection(resource) {
    return {
      actions: resource.actions,
      defaultAction: resource.data.defaultAction,
      defaultDirection: resource.data.defaultDirection
    };
  }

  static generateSpritesheet(resource) {
    if (resource.extension !== 'json' || !resource.data.frames)
      return;
    let textures = resource.textures; // All textures in an object
    let meta = resource.data.meta; // resource.data is the JSON data
    let ticksPerFrame = meta.ticksPerFrame;
    let linearScale = meta.scaleMode === "0" || meta.scaleMode === 0 || meta.scaleMode === "LINEAR";
    for (let texture of Object.values(textures)) {
      texture.baseTexture.scaleMode = linearScale ? PIXI.SCALE_MODES.LINEAR : PIXI.SCALE_MODES.NEAREST;
    }
    let offset;
    if (meta.offset !== undefined)
      offset = new TwoVector(meta.offset.x, meta.offset.y);
    else
      offset = new TwoVector(0, 0);

    return {textures, ticksPerFrame, offset};
  }

  static onProgress(func) {
    // TODO Weak sets?
    SpriteLoader.progressHandlers.push(func);
    return SpriteLoader;
  }

  // TODO Resources (from Pixi's loader) have a smoother onProgress function for each resource individually, use that on-top
  static progress(value, max) {
    SpriteLoader.progressHandlers.forEach((f) => f(value, max));
  }

  static useLoadedAssetCollection(resource, next) {
    // We only want to process asset collection files, not anything else that's loaded in the loader
    if (resource.extension !== 'json' || !resource.data || resource.data.type !== 'asset') {
      next(); // We must explicitly tell the loader to progress to the next middleware function
      return;
    }

    // Next, we load all spritesheets into the asset collection
    resource.actions = {};
    const promises = [];
    const options = {
      loadType: require('resource-loader').Resource.LOAD_TYPE.JSON,
      parentResource: resource
    };
    for (let action of Object.keys(resource.data.actions)) {
      resource.actions[action] = [];    // note the difference between resource.data.actions and resource.actions
      for (let direction of Object.keys(resource.data.actions[action])) {
        const sheet = resource.data.actions[action][direction];
        if (typeof sheet === 'string') {
          let path = url.resolve(resource.url, sheet);
          let promise = SpriteLoader.addAsyncToCustom(this, path, path, options);
          promise.then((sheetResource) => {
            resource.actions[action][direction] = SpriteLoader.generateSpritesheet(sheetResource);
          });
          promises.push(promise);
        } else if (typeof sheet === 'object') {
          resource.actions[action][direction] = SpriteLoader.generateSpritesheet(sheet);
        }
      }
    }

    // After we've dealt with all promises, go to the next middleware function
    Promise.all(promises).then(() => {
      next();
    });
  }

  static addAsyncToCustom(loader, name, path, options) {
    return new Promise(resolve => {
      loader.add(name, path, options, resolve);
    });
  }


}

SpriteLoader.currentId = 0;
SpriteLoader.toLoad = {};
SpriteLoader.loadedAssets = {};
SpriteLoader.loadedSpritesheets = {};
SpriteLoader.inittedLoader = false;
SpriteLoader.resourceDirectory = '';
SpriteLoader.progressHandlers = [];

module.exports = SpriteLoader;
