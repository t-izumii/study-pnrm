import type { Particle } from "../core/Particle";
import { PARTICLE_CONFIG } from "../config/particle-config";

export class PhysicsEngine {
  private friction: number;
  private moveSpeed: number;

  constructor(friction?: number, moveSpeed?: number) {
    this.friction = friction ?? PARTICLE_CONFIG.friction;
    this.moveSpeed = moveSpeed ?? PARTICLE_CONFIG.moveSpeed;
  }

  /**
   * 物理パラメータを動的に設定
   */
  setParams(friction?: number, moveSpeed?: number): void {
    if (friction !== undefined) this.friction = friction;
    if (moveSpeed !== undefined) this.moveSpeed = moveSpeed;
  }

  applyRestoreForce(particle: Particle) {
    particle.vx += (particle.savedX - particle.x) * this.moveSpeed;
    particle.vy += (particle.savedY - particle.y) * this.moveSpeed;
  }

  applyFriction(particle: Particle) {
    particle.vx *= this.friction;
    particle.vy *= this.friction;
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
