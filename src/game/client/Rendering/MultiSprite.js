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
        anim.animationSpeed = 1 / spritesheet.ticksPerFrame; // TODO Switch from PIXI animator/timer to custom one that can be sync'd
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


  getAnimatedSprite(actionName, facingDirectionName) {
    if (actionName === undefined || facingDirectionName === undefined)
      return undefined;

    return splitUntilIndex(splitUntilIndex(this.sprites, actionName), facingDirectionName);
  }

  getCurrentAnimatedSprite() {
    return this.getAnimatedSprite(this.action, this.direction);
  }

  update(newActionName, newDirectionName) {
    let anim = this.getCurrentAnimatedSprite();

    if (anim !== undefined) {
      anim.stop();
      this.removeChild(anim);
    }

    this.action = newActionName || this.action;
    if (newDirectionName !== 'zero')
      this.direction = newDirectionName || this.direction;

    if (this.action === undefined || this.direction === undefined) {
      return;
    }

    anim = this.getCurrentAnimatedSprite();
    if (anim !== undefined) {
      anim.gotoAndPlay(0);      // TODO Don't always start at 0 - start where the Action is at rn
      this.addChild(anim);
    } else {
      console.warn("No animation defined for " + this.action + " " + this.direction + "!");
    }
  }

}



function* backSpliterator(s) {
  let arr = s.split('-');
  while (arr.length > 0) {
    yield arr.join('-');
    arr.pop();
  }
}

function splitUntilIndex(obj, s) {
  if (obj == undefined)
    return undefined;

  let e;
  let spliterator = backSpliterator(s);
  let n;
  while (e === undefined && !(n = spliterator.next()).done) {
    e = obj[n.value];
  }
  return e;
}


module.exports = MultiSprite;
