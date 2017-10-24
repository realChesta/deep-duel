'use strict'

const $ = require('jquery');
const DirectionalSprite = require('./DirectionalSprite');

class MultiSprite extends PIXI.Container {
  constructor(name) {
    super();

    this.sprites = {};
    for (let key of Object.keys(spriteData)) {
      let dir = {};
      for (let k of Object.keys(spriteData[key])) {
        dir[k] = ;
      }
      this.sprites[key] = dir;
    }


  }
}

module.exports = MultiSprite;
