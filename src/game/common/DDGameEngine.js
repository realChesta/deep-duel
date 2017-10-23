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
    this.on('playerJoined', this.onPlayerJoined.bind(this));
    this.on('playerDisconnected', this.onPlayerDisconnected.bind(this));

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
      }
      else if (inputData.input === 'down') {
        player.movingY = 1;
      }
      else if (inputData.input === 'right') {
        player.movingX = 1;
      }
      else if (inputData.input === 'left') {
        player.movingX = -1;
      }
      else if (inputData.input === 'fire') {
        player.fire();
      }
    }
  }

  onPlayerJoined(event) {
    console.log("Player joined", event);
    let player = new Player(++this.world.idCount, 200, 200, event.playerId);
    this.players[this.world.idCount] = player;
    this.addObjectToWorld(player);
    this.addObjectToWorld(new Entity(++this.world.idCount, 150, 200));
  }

  onPlayerDisconnected(event) {
    var playerId = event.playerId;
    if (!this.players[playerId])
      return;
    this.removeObjectFromWorld(this.players[playerId].id);
  }

  onObjectAdded(object) {
    if (object instanceof Player) {
      var playerId = object.playerId;
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
      var dv = player.movingX * player.movingX + player.movingY * player.movingY;
      if (dv == 0) continue; // fuck this
      player.position.x += player.movingX * player.getSpeed() / dv;
      player.position.y += player.movingY * player.getSpeed() / dv;
      player.movingX = player.movingY = 0;
    }
  }


  registerClasses(serializer) {
    serializer.registerClass(Entity);
    serializer.registerClass(Player);

    console.log('serializer: ', serializer.registeredClasses);
  }
}

module.exports = DDGameEngine;
