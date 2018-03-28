'use strict';

import Entity from './Entity';
import Serializer from 'lance/serialize/Serializer';
import TwoVector from 'lance/serialize/TwoVector';


export default class Projectile extends Entity {

  static get netScheme() {
    return Object.assign({
      radius: {type: Serializer.TYPES.INT16},
      projectileDamage: {type: Serializer.TYPES.INT16},
      shooterId: {type: Serializer.TYPES.INT32},
      velocity: {type: Serializer.TYPES.CLASSINSTANCE},
      destroyAt: {type: Serializer.TYPES.INT32},
    }, super.netScheme);
  }

  syncTo(other) {
    super.syncTo(other);
    this.radius = other.radius;
    this.projectileDamage = other.projectileDamage;
    this.shooterId = other.shooterId;
    this.destroyAt = other.destroyAt;
    this.velocity = other.velocity.clone();
  }

  constructor(gameEngine, x, y, velocity, shooter, radius, projectileDamage, lifespan) {
    super(gameEngine, x, y);
    if (velocity) this.velocity = velocity;
    this.shooter = shooter;
    this.radius = radius;
    this.projectileDamage = projectileDamage;

    // TODO HACK Lance-gg serialization workaround
    if (gameEngine !== null)
      this.destroyAt = gameEngine.world.stepCount + (lifespan || 100);
  }

  get shooterId() {
    return (this._shooter === undefined || typeof this._shooter === 'number') ?
              this._shooter :
              this._shooter.id;
  }

  set shooterId(value) {
    this._shooter = this.gameEngine !== null ? this.gameEngine.world.objects[value] : value;
  }

  get shooter() {
    return (this._shooter === undefined || typeof this._shooter === 'number') ?
              this.gameEngine.world.objects[this._shooter] :
              this._shooter;
  }

  set shooter(value) {
    this._shooter = value;
  }

  tick(gameEngine) {
    super.tick(gameEngine);
    if (this.gameEngine.world.stepCount >= this.destroyAt) {
      this.gameEngine.removeObjectFromWorld(this);
      return;
    }

    this.detectCollision(gameEngine);
  }

  isFlying() {
    return true;
  }

  detectCollision(gameEngine) {
    // TODO Move collision detection to its own class and make this a circle collider

    const abs = Math.abs;
    const sq = (x) => x*x;
    const x = this.x, y = this.y, radius = this.radius;

    // For now, this is a rectangular collider (instead of circle). Fix later
    let hits = gameEngine.filterObjects((obj) => {
      if (obj == this.shooter || obj == this || !obj.hitbox || !obj.isDamageable()) return false;

      let hb = obj.hitbox;
      let left = hb.getLeft(obj.position);
      let right = hb.getRight(obj.position);
      let upper = hb.getUpper(obj.position);
      let lower = hb.getLower(obj.position);

      return (x + radius >= left && x - radius <= right &&
                y + radius >= upper && y - radius <= lower);
    });

    if (hits.length <= 0) return;
    if (hits.length == 1) {
      this.hit(hits[0]);
      return;
    }

    // TODO Test this
    let curBest = undefined;
    let curBestRS = -1;
    for (let obj of hits) {
      let px = x - this.velocity.x, py = y - this.velocity.y;
      let ds = sq(obj.x - px) + sq(obj.y - py);
      if (curBest == undefined || ds < curBestRS) {
        curBest = obj;
        curBestRS = ds;
      }
    }

    this.hit(curBest);
  }

  hit(gameObject) {
    gameObject.takeDamage(this.projectileDamage);
    this.gameEngine.removeObjectFromWorld(this);
  }



  initRenderContainer(container, debugContainer) {
    super.initRenderContainer(container, debugContainer);

    this.graphics = new PIXI.Graphics();
    container.addChild(this.graphics);

    this.graphics.clear();
    this.graphics.beginFill(0xFFFF00);
    this.graphics.drawCircle(0, 0, this.radius);
    this.graphics.endFill();
  }

  onRenderContainerDestroy(container, debugContainer) {
    super.onRenderContainerDestroy(container, debugContainer);

    container.removeChild(this.graphics);
    delete this.graphics;
  }

}

require('../../Utils/ClassLoader').registerClass(Projectile);
