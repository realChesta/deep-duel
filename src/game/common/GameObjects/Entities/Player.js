'use strict';

const Entity = require('./Entity');
const {serialize: {Serializer}} = require('lance-gg');

class Player extends Entity {

  constructor(id, x, y, playerId) {
    super(id, x, y);
    this.playerId = playerId;

    this.movingX = 0;
    this.movingY = 0;

    this.class = Player;
  }

  fire() {
    // TODO Add projectiles
  }

  onAddToWorld() {

  }

}

module.exports = Player;
