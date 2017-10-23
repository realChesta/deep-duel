'use strict';

const Entity = require('./Entity');
const {serialize: {Serializer}} = require('lance-gg');

class Player extends Entity {

  constructor(id, x, y, playerId) {
    super(id, x, y);
    this.playerId = playerId;
    this.class = Player;

    this.movingX = 0;
    this.movingY = 0;
  }


  fire() {
    // TODO Add projectiles
  }

}

module.exports = Player;
