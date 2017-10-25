'use strict';

const {GameEngine} = require('lance-gg');
const Entity = require('./GameObjects/Entities/Entity');
const Creature = require('./GameObjects/Entities/Creature');
const Character = require('./GameObjects/Entities/Character');
const Player = require('./GameObjects/Entities/Player');


// TODO Rename playerId everywhere
class DDGameEngine extends GameEngine {

  constructor(options) {
    super(options);

    this.on('preStep', this.preStep);
    this.on('objectAdded', this.onObjectAdded.bind(this));
    this.on('objectDestroyed', this.onObjectDestroyed.bind(this));
    this.on('playerJoined', this.onPlayerJoined.bind(this));
    this.on('playerDisconnected', this.onPlayerDisconnected.bind(this));

    this.characters = {};

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

    this.characters[playerId].processInput(inputData);
  }

  onPlayerJoined(event) {
    let character = new Player(++this.world.idCount, 50, 50, event.playerId);
    this.characters[this.world.idCount] = character;
    this.addObjectToWorld(character);
  }

  onPlayerDisconnected(event) {
    var playerId = event.playerId;
    if (!this.characters[playerId])
      return;
    this.removeObjectFromWorld(this.characters[playerId].id);
  }

  onObjectAdded(object) {
    if (object instanceof Character) {
      var playerId = object.playerId;
      this.characters[playerId] = object;
    }
  }

  onObjectDestroyed(object) {
    if (object instanceof Character) {
      var playerId = object.playerId;
      delete this.characters[playerId];
    }
  }


  preStep() {
    var keys = Object.keys(this.characters);
    for (let i = 0; i < keys.length; i++) {
      let character = this.characters[keys[i]];
      character.calcVelocity();
      character.tickInputs();
    }
  }


  registerClasses(serializer) {
    serializer.registerClass(Entity);
    serializer.registerClass(Creature);
    serializer.registerClass(Character);
    serializer.registerClass(Player);
  }
}

module.exports = DDGameEngine;
