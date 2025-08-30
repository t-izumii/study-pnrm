import type { MouseState, Force } from "../types/particle-types";
import { Particle } from "../core/Particle";

export class MouseInteraction {
  constructor() {}

  calculateDistance(mouse: MouseState, particle: Particle): number {
    const dx = mouse.x - particle.x;
    const dy = mouse.y - particle.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  calculateRepulsionForce(mouse: MouseState, particle: Particle): Force {
    const dx = mouse.x - particle.x;
    const dy = mouse.y - particle.y;

    const dist = this.calculateDistance(mouse, particle);

    if (dist < mouse.radius) {
      // 反発処理
      // マウスからパーティクルへの角度を計算
      const angle = Math.atan2(dy, dx);

      // 反発後の目標位置を計算
      const tx = particle.x + Math.cos(angle) * mouse.radius;
      const ty = particle.y + Math.sin(angle) * mouse.radius;

      // 反発ベクトルを計算
      const ax = tx - mouse.x;
      const ay = ty - mouse.y;

      return { x: ax, y: ay };
    }

    return { x: 0, y: 0 };
  }

  applyMouseInteraction(mouse: MouseState, particle: Particle): void {
    const force = this.calculateRepulsionForce(mouse, particle);

    if (force) {
      particle.vx -= force.x;
      particle.vy -= force.y;
    }
  }

  processAllParticles(mouse: MouseState, particles: Particle[]): void {
    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      // パーティクルの有効性チェック
      if (!particle || !particle.sprite || particle.sprite.destroyed) {
        continue;
      }

      // このパーティクルにマウス効果を適用
      this.applyMouseInteraction(mouse, particle);

      // パーティクルの物理更新
      particle.draw();
    }
  }
}
