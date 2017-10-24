'use strict';

const {GameEngine} = require('lance-gg');
const Entity = require('./GameObjects/Entities/Entity');
const Player = require('./GameObjects/Entities/Character');

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
      height: 100
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

    this.players[playerId].processInput(inputData);
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
    for (let i = 0; i < keys.length; i++) {
      let player = this.players[keys[i]];
      player.calcVelocity();
      player.tickInputs();
    }
  }


  registerClasses(serializer) {
    serializer.registerClass(Entity);
    serializer.registerClass(Player);
  }
}

module.exports = DDGameEngine;
