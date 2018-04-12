'use strict';

// Apply band-aid patch to lance-gg
require('./Utils/buggy-gg');

import DeepDuel from 'game/common/DeepDuel';
import ClassLoader from 'game/common/Utils/ClassLoader';
import TileMap from 'game/common/TileMap';
import GameEngine from 'lance/GameEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
import Serializer from 'lance/serialize/Serializer'
const Entity = require('./GameObjects/Entities/Entity');
const Creature = require('./GameObjects/Entities/Creature');
const Character = require('./GameObjects/Entities/Character');
const Player = require('./GameObjects/Entities/Player');
const Scarecrow = require('./GameObjects/Entities/Scarecrow');
const DDCollisionDetection = require('./Physics/Collision/DDCollisionDetection');
const Hitbox = require('./Physics/Collision/Hitbox');

DeepDuel.gameEngines = [];    // TODO weak set


// TODO Rename playerId everywhere
class DDGameEngine extends GameEngine {

  constructor(options) {
    super(options);
    this.physicsEngine = new SimplePhysicsEngine({gameEngine: this});

    this.on('preStep', this.preStep.bind(this));
    this.on('objectAdded', this.onObjectAdded.bind(this));
    this.on('objectDestroyed', this.onObjectDestroyed.bind(this));
    this.on('playerJoined', this.onPlayerJoined.bind(this));
    this.on('playerDisconnected', this.onPlayerDisconnected.bind(this));
    this.on('keepAlive', this.keepAlive.bind(this));

    this.characters = {};

    this.tileMap = new TileMap();

    this.settings = {
      width: this.tileMap.width * this.tileMap.tileWidth,
      height: this.tileMap.height * this.tileMap.tileHeight
    };

    this.physicsEngine.collisionDetection = new DDCollisionDetection();


    DeepDuel.gameEngines.push(this);
  }

  start() {
    super.start();
    this.initGame();
    this.hasStarted = true;
  }

  initWorld() {
      super.initWorld({
          width: this.settings.width,
          height: this.settings.height
      });
  }

  initGame() {
    this.addObjectToWorld(new Scarecrow(this, 70, 70));
  }



  filterObjects(objectFilter) {
    return Object.values(this.world.objects).filter(objectFilter);
  }


  processInput(inputData, playerId) {
    super.processInput(inputData, playerId);

    this.characters[playerId].processInput(inputData);
  }

  onPlayerJoined(event) {
    let character = new Player(this, this.settings.width/2, this.settings.height/2, event.playerId);
    this.addObjectToWorld(character);
  }

  onPlayerDisconnected(event) {
    this.removeObjectFromWorld(this.characters[event.playerId].id);
  }

  keepAlive(event) {
    var playerId = event.playerId;
    if (!this.characters[playerId])
      return;
    this.characters[playerId].keepAlive(this);
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
      character.calcVelocity(this);
      character.tickInputs(this);
    }
  }



  registerClasses(serializer) {
    if (serializer.isHijackedRegisterer === true) return;

    super.registerClasses.apply(this, arguments);
    // All we do is hijack the serializer
    Serializer.setClassRegisterer(serializer, new Serializer.ClassRegisterer(serializer.registeredClasses));
  }

}

module.exports = DDGameEngine;
