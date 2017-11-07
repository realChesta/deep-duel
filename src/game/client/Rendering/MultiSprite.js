'use strict';

const PIXI = require('pixi.js');
const SpriteLoader = require('../../common/Utils/SpriteLoader');

class MultiSprite extends PIXI.Container {
  constructor(assetsId, defaultAction, defaultDirection) {
    super();

    let assetCollection = SpriteLoader.getAssetCollection(assetsId);
    let actions = assetCollection.actions;

    this.sprites = {};
    for (let action of Object.keys(actions)) {
      let dir = {};
      for (let direction of Object.keys(actions[action])) {
        let spritesheet = actions[action][direction];
        let anim = new PIXI.extras.AnimatedSprite(Object.values(spritesheet.textures));
        anim.animationSpeed = spritesheet.fps / 60; // TODO Switch from PIXI animator/timer to custom one that can be sync'd
        anim.x = spritesheet.offset.x;
        anim.y = spritesheet.offset.y;
        dir[direction] = anim;
      }
      this.sprites[action] = dir;
    }

    this.update(assetCollection.defaultAction, assetCollection.defaultDirection);
  }

  setAction(val) {
    if (this.action !== val)
      this.update(val, undefined);
  }

  setDirection(val) {
    val = val.name;
    if (this.direction !== val)
      this.update(undefined, val);
  }


  getAnimatedSprite(action, direction) {
    if (action === undefined || direction === undefined)
      return undefined;

    let spriteActions = this.sprites[action];
    if (spriteActions === undefined)
      return undefined;

    let sprite = spriteActions[direction];
    if (sprite === undefined) {
      let arr = this.direction.split('-');
      while (sprite === undefined && arr.length > 0) {
        arr.pop();
        sprite = this.sprites[this.action][arr.join('-')];
      }
    }
    return sprite;
  }

  getCurrentAnimatedSprite() {
    return this.getAnimatedSprite(this.action, this.direction);
  }

  update(newAction, newDirection) {
    let anim = this.getCurrentAnimatedSprite();

    if (anim !== undefined) {
      anim.stop();
      this.removeChild(anim);
    }

    this.action = newAction || this.action;
    if (newDirection !== 'zero')
      this.direction = newDirection || this.direction;

    if (this.action === undefined || this.direction === undefined) {
      return;
    }

    anim = this.getCurrentAnimatedSprite();
    if (anim !== undefined) {
      anim.play();
      this.addChild(anim);
    } else {
      console.warn("No animation defined for " + this.action + " " + this.direction + "!");
    }
  }

}

module.exports = MultiSprite;
