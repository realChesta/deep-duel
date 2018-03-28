'use strict';

import DDDefaultRenderer from 'game/client/DefaultClient/Rendering/DDDefaultRenderer';
import pixiClear from 'game/client/DefaultClient/Rendering/pixiClear';
const PIXI = require('pixi.js');


class BackgroundContainer extends PIXI.Container {

  constructor(gameEngine) {
    super();
    this.gameEngine = gameEngine;
    this.updateBackground();
  }

  updateBackground() {
    pixiClear(this);

    let tileMap = this.gameEngine.tileMap;
    let w = tileMap.width;
    let h = tileMap.height;
    let tw = tileMap.tileWidth;
    let th = tileMap.tileHeight;
    let tiles = tileMap.tiles;
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        let t = tiles[j*w + i];
        if (t !== 0) {
          let sprite = this.createTileSprite(t, tw, th);
          sprite.position.x = i * tw;
          sprite.position.y = j * th;
          this.addChild(sprite);
        }
      }
    }
  }

  createTileSprite(id, width, height) {
    let graphics = new PIXI.Graphics();
    graphics.beginFill(0x00AA00);
    graphics.drawRect(0, 0, width, height);
    graphics.endFill();
    return graphics;
  }

}





module.exports = BackgroundContainer;
