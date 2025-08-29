import * as PIXI from "pixi.js";
import { Particle } from "./Particle";
import type { MouseState } from "../types/particle-types";
import type { Position } from "../types/particle-types";
import { MOUSE_CONFIG } from "../config/particle-config";

export class ParticleSystem {
  private particles: Particle[] = [];
  private container?: PIXI.ParticleContainer;
  private positions: Position[] = [];
  private mouse: MouseState;
  private texture: any;

  constructor(texture: any) {
    this.texture = texture;
    this.mouse = {
      x: 0,
      y: 0,
      radius: MOUSE_CONFIG.radius,
    };
    this.setupEventListeners();
  }

  private createParticles(positions: Position[], stage: PIXI.Container): void {
    if (this.container) {
      this.container.destroy();
      this.particles = [];
    }

    this.container = new PIXI.ParticleContainer();
    this.positions = positions;

    for (const position of positions) {
      const particle = new Particle(position, this.texture);
      this.particles.push(particle);
      this.container!.addChild(particle.sprite);
    }

    stage.addChild(this.container);
  }

  private setupEventListeners(): void {
    document.addEventListener("pointermove", this.onMove.bind(this), false);
  }

  private onMove(e: PointerEvent) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  animate() {
    if (!this.particles || this.particles.length === 0) return;

    for (let i = 0; i < this.particles.length; i++) {
      const item = this.particles[i];

      if (!item || !item.sprite || item.sprite.destroyed) continue;

      const dx = this.mouse.x - item.x;
      const dy = this.mouse.y - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy); // ユークリッド距離
      const minDist = this.mouse.radius;

      const dx = this.mouse.x - item.x;
      const dy = this.mouse.y - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy); // ユークリッド距離
      const minDist = this.mouse.radius;

      // マウスの影響範囲内にある場合、反発力を計算
      if (dist < minDist) {
        // マウスからパーティクルへの角度を計算
        const angle = Math.atan2(dy, dx);

        // 反発後の目標位置を計算
        const tx = item.x + Math.cos(angle) * minDist;
        const ty = item.y + Math.sin(angle) * minDist;

        // マウス位置からの反発ベクトルを計算
        const ax = tx - this.mouse.x;
        const ay = ty - this.mouse.y;

        // パーティクルの速度に反発力を適用（減算で反発方向）
        item.vx -= ax;
        item.vy -= ay;
      }

      // パーティクルの物理更新と描画
      item.draw();
    }
  }
}
