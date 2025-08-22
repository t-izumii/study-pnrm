import * as PIXI from "pixi.js";
import { PARTICLE_CONFIG } from "./config";

// Local type definition to avoid import issues
interface Position {
  x: number;
  y: number;
}

export class Particle {
  sprite: PIXI.Sprite;
  savedX: number;
  savedY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;

  constructor(pos: Position, texture: PIXI.Texture) {
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.scale.set(PARTICLE_CONFIG.scale);
    this.sprite.tint = PARTICLE_CONFIG.tint;

    this.savedX = pos.x;
    this.savedY = pos.y;
    this.x = pos.x;
    this.y = pos.y;
    this.sprite.x = this.x;
    this.sprite.y = this.y;

    this.vx = 0;
    this.vy = 0;
    this.radius = PARTICLE_CONFIG.radius;
  }

  draw(): void {
    this.vx += (this.savedX - this.x) * PARTICLE_CONFIG.moveSpeed;
    this.vy += (this.savedY - this.y) * PARTICLE_CONFIG.moveSpeed;

    this.vx *= PARTICLE_CONFIG.friction;
    this.vy *= PARTICLE_CONFIG.friction;

    this.x += this.vx;
    this.y += this.vy;

    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
}
