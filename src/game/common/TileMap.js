'use strict';

class TileMap {
  constructor() {
    this.tiles = TileMap.defaultMap.splice(0);
    this.width = TileMap.defaultWidth;
    this.height = TileMap.defaultHeight;
    this.tileWidth = TileMap.defaultTileWidth;
    this.tileHeight = TileMap.defaultTileHeight;
  }

  getTileAt(x, y) {
    return this.tiles[this.width * Math.floor(y) + Math.floor(x)];
  }

  setTileAt(x, y, value) {
    this.tiles[this.width * Math.floor(y) + Math.floor(x)] = value;
  }

}


TileMap.defaultTileWidth = 16;
TileMap.defaultTileHeight = 16;
TileMap.defaultWidth = 17;
TileMap.defaultHeight = 17;
(function() {
  const _ = 0;
  TileMap.defaultMap = [
    _, _, _, _, _, _, _, _, 1, _, _, _, _, _, _, _, _,
    _, _, _, _, _, _, _, 1, 1, 1, _, _, _, _, _, _, _,
    _, _, _, _, _, _, 1, 1, 1, 1, 1, _, _, _, _, _, _,
    _, _, _, _, _, 1, 1, 1, 1, 1, 1, 1, _, _, _, _, _,
    _, _, _, _, 1, 1, 1, 1, 1, 1, 1, 1, 1, _, _, _, _,
    _, _, _, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, _, _, _,
    _, _, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, _, _,
    _, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, _,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    _, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, _,
    _, _, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, _, _,
    _, _, _, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, _, _, _,
    _, _, _, _, 1, 1, 1, 1, 1, 1, 1, 1, 1, _, _, _, _,
    _, _, _, _, _, 1, 1, 1, 1, 1, 1, 1, _, _, _, _, _,
    _, _, _, _, _, _, 1, 1, 1, 1, 1, _, _, _, _, _, _,
    _, _, _, _, _, _, _, 1, 1, 1, _, _, _, _, _, _, _,
    _, _, _, _, _, _, _, _, 1, _, _, _, _, _, _, _, _,
  ];
})();


module.exports = TileMap;
