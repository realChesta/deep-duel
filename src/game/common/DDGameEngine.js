'use strict';

// Apply band-aid patch to lance-gg
require('./Utils/buggy-gg');

const DeepDuel = require('./DeepDuel');
const ClassLoader = require('./Utils/ClassLoader');
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

DeepDuel.gameEngines = [];


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

    this.settings = {
      width: 256,
      height: 256
    };

    this.physicsEngine.collisionDetection = new DDCollisionDetection();


    DeepDuel.gameEngines.push(this);
  }

  start() {
    super.start();
    this.initGame();
  }

  initWorld(){
      super.initWorld({
          worldWrap: true,
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
    let character = new Player(this, 128, 128, event.playerId);
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
    // All we do is hijack the serializer
    Object.assign(ClassLoader.classRegisterer, serializer.registeredClasses);
    Serializer.setClassRegisterer(serializer, ClassLoader.classRegisterer);
  }

}

module.exports = DDGameEngine;
