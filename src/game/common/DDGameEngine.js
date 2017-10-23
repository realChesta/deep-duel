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

    this.settings = {
      width: 100,
      height: 100,
      diagonalSpeed: 0    // 0...1
    };
  }

  start() {
    super.start();
  }

  initGame() {
    // Quite dusty here...
  }


  processInput(inputData, playerId) {
    super.processInput(inputData, playerId);

    let player = this.players[playerId];
    if (player) {
      if (inputData.input === 'up') {
        player.movingY = inputData.options.isDown ? -1 : 0;
        //player.direction = 2;
      }
      else if (inputData.input === 'down') {
        player.movingY = inputData.options.isDown ? 1 : 0;
        //player.direction = 0;
      }
      else if (inputData.input === 'right') {
        player.movingX = inputData.options.isDown ? 1 : 0;
        //player.direction = 3;
      }
      else if (inputData.input === 'left') {
        player.movingX = inputData.options.isDown ? -1 : 0;
        //player.direction = 1;
      }
      else if (inputData.input === 'fire') {
        player.fire();
      }
    }
  }

  onPlayerJoined(event) {
    let player = new Player(++this.world.idCount, 50, 50, event.playerId);
    this.players[this.world.idCount] = player;
    this.addObjectToWorld(player);
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
      var movingX = player.movingX, movingY = player.movingY;
      var dv = movingX * movingX + movingY * movingY;
      if (dv == 0) {
        player.currentAction = Player.ActionType.Idle;
        continue;
      }

      if (movingX === 1) player.direction = 3;
      else if (movingX === -1) player.direction = 1;

      if (movingY === 1) player.direction = 0;
      else if (movingY === -1) player.direction = 2;

      dv = Math.pow(dv, 1 - this.settings.diagonalSpeed);
      player.position.x += movingX * player.getSpeed() / dv;
      player.position.y += movingY * player.getSpeed() / dv;

      player.currentAction = Player.ActionType.Running;

      //player.movingX = player.movingY = 0;
    }
  }


  registerClasses(serializer) {
    serializer.registerClass(Entity);
    serializer.registerClass(Player);
  }
}

module.exports = DDGameEngine;
