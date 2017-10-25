'use strict';

const url = require('url');
const {serialize: {TwoVector}} = require('lance-gg');

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


  // TODO Currently, you specify assets by their names - however, in a future version, make .add() return an object that identifies them instead
  static add(name, path) {
    if (path === undefined)
      path = name;

    SpriteLoader.toLoad[name] = path;
    console.log(SpriteLoader.toLoad);
    return SpriteLoader;
  }

  static addAll(name, paths) {
    for (let path of paths) {
      SpriteLoader.add(name + '; ' + path, path);
    }
    return SpriteLoader;
  }


  static async loadAll() {
    const PIXI = require('pixi.js');

    // Add all the sprites to the PIXI loader
    let toL = Object.keys(SpriteLoader.toLoad);
    if (toL)
    for (let name of toL) {
      PIXI.loader.add(name, SpriteLoader.toLoad[name], SpriteLoader.onResourceLoaded);
    }

    // Initialize Pixi's loader to use custom middleware functions (if it wasn't already)
    if (!SpriteLoader.inittedLoader) {
      PIXI.loader.use(SpriteLoader.useLoadedAssetCollection);     // runs after a resource was loaded, but before the .resourceLoaded callback
      SpriteLoader.inittedLoader = true;
    }

    // Actually start loading now. We don't want a callback, rather await syntax so we wrap it in a Promise
    await new Promise((resolve) => {
      console.log(PIXI.loader);
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
    if (resource.extension === 'json' && resource.data.type === 'asset')
      SpriteLoader.loadedAssets[resource.name] = SpriteLoader.generateAssetCollection(resource);
    else if (resource.extension === 'json' && resource.data.frames) // This is used by Pixi's spritesheet parser. There could be some false negatives (any JSON file with a frames property), but I did not get up with it
      SpriteLoader.loadedSpritesheets[resource.name] = SpriteLoader.generateSpritesheet(resource);
  }

  static generateAssetCollection(resource) {
    console.log(resource);
    return {
      actions: resource.actions,
      defaultAction: resource.data.defaultAction,
      defaultDirection: resource.data.defaultDirection
    };
  }

  static generateSpritesheet(resource) {
    if (resource.extension !== 'json' || !resource.data.frames)
      return;
    let textures = resource.textures; // All textures in an array.
    let meta = resource.data.meta; // resource.data is the JSON data
    let fps = meta.fps;
    let size = meta.sourceSize === undefined ? {} : new TwoVector(meta.sourceSize.w, meta.sourceSize.h);
    let offset = meta.offset === undefined ? {} : new TwoVector(meta.offset.x, meta.offset.y);

    // all Pixi spritesheet JSONs necessarily have all these properties (especially fps and offset, which are not standard), so we're gonna warn the user if they're not found
    let check = {'fps': fps, 'size.x': size.x, 'size.y': size.y, 'offset.x': offset.x, 'offset.y': offset.y};
    for (let key of Object.keys(check)) {
      if (check[key] === undefined) {
        console.warn(key + " of resource " + resource.name + " is undefined! (from URL " + resource.url + ")");
      }
    }

    return {textures, fps, size, offset};
  }

  static useLoadedAssetCollection(resource, next) {
    // We only want to process asset collection files, not anything else that's loaded in the loader
    if (resource.extension !== 'json' || resource.data.type !== 'asset') {
      next(); // We must explicitly tell the loader to progress to the next middleware function
      return;
    }

    // Next, we load all spritesheets into the asset collection
    resource.actions = {};
    let promises = [];
    let options = {
      loadType: require('resource-loader').Resource.LOAD_TYPE.JSON,
      parentResource: resource
    };
    for (let action of Object.keys(resource.data.actions)) {
      resource.actions[action] = [];    // note the difference between resource.data.actions and resource.actions
      for (let direction of Object.keys(resource.data.actions[action])) {
        let path = url.resolve(resource.url, resource.data.actions[action][direction]);
        let promise = SpriteLoader.addAsyncToCustom(this, path, path, options);
        promise.then((sheetResource) => {
          resource.actions[action][direction] = SpriteLoader.generateSpritesheet(sheetResource);
        });
        promises.push(promise);
      }
    }

    // After we've dealt with all promises, go to the next middleware function
    Promise.all(promises).then(() => {
      next();
    });
  }

  static async addAsyncToCustom(loader, name, path, options) {
    return new Promise(resolve => {
      loader.add(name, path, options, resolve);
    });
  }


}

SpriteLoader.toLoad = {};
SpriteLoader.loadedAssets = {};
SpriteLoader.loadedSpritesheets = {};
SpriteLoader.inittedLoader = false;

module.exports = SpriteLoader;
