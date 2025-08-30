import type { Force, Position } from "../types/particle-types";
import type { Particle } from "../core/Particle";
import { PARTICLE_CONFIG } from "../config/particle-config";

export class PhysicsEngine {
  constructor() {}

  applyRestoreForce(particle: Particle) {
    particle.vx += (particle.savedX - particle.x) * PARTICLE_CONFIG.moveSpeed;
    particle.vy += (particle.savedY - particle.y) * PARTICLE_CONFIG.moveSpeed;
  }

  applyFriction(particle: Particle) {
    particle.vx *= PARTICLE_CONFIG.friction;
    particle.vy *= PARTICLE_CONFIG.friction;
  }

  updatePosition(particle: Particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
  }

  syncSpritePosition(particle: Particle) {
    particle.sprite.x = particle.x;
    particle.sprite.y = particle.y;
  }

  updatePhysics(particle: Particle) {
    // 1. 復元力の適用（元の位置に戻ろうとする力）
    this.applyRestoreForce(particle);

    // 2. 摩擦力の適用（速度を減衰させる）
    this.applyFriction(particle);

    // 3. 位置の更新（速度に基づいて位置を移動）
    this.updatePosition(particle);

    // 4. 描画位置の同期（PIXI.Spriteの位置を更新）
    this.syncSpritePosition(particle);
  }
}
