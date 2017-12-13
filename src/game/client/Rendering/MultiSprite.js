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
        let anim = new PIXI.extras.AnimatedSprite(Object.values(spritesheet.textures), false);
        anim.animationSpeed = 1 / (spritesheet.ticksPerFrame || Infinity);
        anim.x = spritesheet.offset.x;
        anim.y = spritesheet.offset.y;
        if (!(spritesheet.offset && spritesheet.offset.x && spritesheet.offset.y)) {
          throw new Error("Sprite offset data is invalid or undefined: " + spritesheet);
        }
        dir[direction] = anim;
      }
      this.sprites[action] = dir;
    }

    this.update(assetCollection.defaultAction, assetCollection.defaultDirection);
  }

  tick(stepCount) {
    if (stepCount <= this.lastStepCount)
      return;

    let delta = stepCount - this.lastStepCount;
    let anim = this.getCurrentAnimatedSprite();
    if (anim !== undefined)
      anim.update(delta);

    this.lastStepCount = stepCount;
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

  update(newActionName, newDirectionName, gameEngine) {
    let anim = this.getCurrentAnimatedSprite();

    if (anim !== undefined) {
      anim.stop();
      this.removeChild(anim);
    }

    this.action = newActionName || this.action;
    if (newDirectionName !== 'zero')       // TODO We have input and facing direction now, make use of that
      this.direction = newDirectionName || this.direction;

    if (this.action === undefined || this.direction === undefined) {
      return;
    }

    anim = this.getCurrentAnimatedSprite();
    if (anim !== undefined) {
      this.lastStepCount = 0;
      anim.gotoAndPlay(0);
      //this.tick(action.ticksPassed); // TODO insert how much already passed of the action
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
