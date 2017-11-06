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
    let sprite = this.sprites[action][direction];
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
    if (this.action !== undefined && this.direction !== undefined) {
      let anim = this.getCurrentAnimatedSprite();
      anim.stop();
      this.removeChild(anim);
    }

    this.action = newAction || this.action;
    if (newDirection !== 'zero')
      this.direction = newDirection || this.direction;

    if (this.action === undefined || this.direction === undefined) {
      return;
    }

    let anim = this.getCurrentAnimatedSprite();
    anim.play();
    this.addChild(anim);
  }

}

module.exports = MultiSprite;
