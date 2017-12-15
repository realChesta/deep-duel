'use strict';

const PIXI = require('pixi.js');
const SpriteLoader = require('../../common/Utils/SpriteLoader');

class HealthBar extends PIXI.Container {

  constructor(character) {
    super();

    const heartsSprites = HealthBar.heartsSprites;

    const health = character.health;

    const texturesArr = Object.values(heartsSprites.textures);
    const sc = texturesArr.length;

    this.totalWidth = Math.ceil(character.maxHealth / sc) * texturesArr[0].width;   // TODO don't use 0th element, find better solution
    this.totalHeight = texturesArr[0].height;


    for (let i = 0; i < Math.ceil(health / sc); i++) {
      const txt = texturesArr[sc - Math.min(health - i * sc, sc)];
      const heart = new PIXI.Sprite(txt);
      heart.position.x = i * txt.width + heartsSprites.offset.x;
      heart.position.y = heartsSprites.offset.y;
      this.addChild(heart);
    }

  }


  static get heartsSprites() {
     return this._heartsSprites || (this._heartsSprites = SpriteLoader.getSpritesheet(heartsSpritesId));
  }

}

const heartsSpritesId = SpriteLoader.add('assets/ui/hearts/red.json');

module.exports = HealthBar;
