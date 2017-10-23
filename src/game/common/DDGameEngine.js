'use strict';

const {GameEngine} = require('lance-gg');
const Entity = require('./GameObjects/Entities/Entity');
const Player = require('./GameObjects/Entities/Player');

class DDGameEngine extends GameEngine {

  constructor(options) {
    super(options);

    this.on('preStep', this.preStep);
    this.on('objectAdded', this.onObjectAdded.bind(this));
    this.on('objectDestroyed', this.onObjectDestroyed.bind(this));

    this.playerIdCur = 0;
    this.players = {};
  }

  start() {
    super.start();

    this.worldSettings = {
      width: 400,
      height: 400
    };
  }

  initGame() {
    // Quite dusty here...
  }


  processInput(inputData, playerId) {
    super.processInput(inputData, playerId);

    let player = this.players[playerId];
    if (player) {
      if (inputData.input === 'up') {
        player.movingY = -1;
      } else if (inputData.input === 'down') {
        player.movingY = 1;
      } else if (inputData.input === 'right') {
        player.movingX = 1;
      } else if (inputData.input === 'left') {
        player.movingX = -1;
      } else if (inputData.input === 'fire') {
        player.fire();
      }
    }
  }

  addPlayer() {
    var object = new Player(++this.world.idCount, 200, 200, ++this.playerIdCur);
    this.addObjectToWorld(object);
  }

  removePlayer(playerId) {
    if (!this.players[playerId])
      return;
    this.removeObjectFromWorld(this.players[playerId].id);
  }

  onObjectAdded(object) {
    if (object instanceof Player) {
      var playerId = object.playerId;
      if (this.players[playerId])
        removePlayer(playerId);
      this.players[playerId] = object;
    }
  }

  onObjectDestroyed(object) {
    if (object instanceof Player) {
      var playerId = object.playerId;
      delete this.players[playerId];
    }
  }



  preStep() {
    var keys = Object.keys(this.players);
    for (var i = 0; i < keys.length; i++) {
      var player = this.players[keys[i]];
      var dv = player.movingX * player.movingX + player.movingY + player.movingY;
      player.position.x += player.movingX * player.getSpeed() / dv;
      player.position.y += player.movingY * player.getSpeed() / dv;
      player.movingX = player.movingY = 0;
    }
  }


  registerClasses(serializer) {
    serializer.registerClass(Entity);
    serializer.registerClass(Player);
  }
}

module.exports = DDGameEngine;
