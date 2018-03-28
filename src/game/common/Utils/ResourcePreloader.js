'use strict';

require('game/common/Utils/buggy-gg');

class ResourcePreloader {
  // We already want to start loading some elements early, eg. so they can already register their sprites.
  // We therefore simply need to require them, as this will call their code and they'll be able to set things up.
  // Example: Player needs to do some calls to SpriteLoader in order to set up, so we already load the Player class early.
  static async preload(noDisplay = false) {
    if (!noDisplay) {
      require('game/common/GameObjects/Entities/Player');
      require('game/client/DDRenderer');
    }
    require('game/common/TileMap');

    await require('game/common/Utils/SpriteLoader').loadAll();
  }
}


module.exports = ResourcePreloader;
