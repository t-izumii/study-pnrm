import * as PIXI from "pixi.js";
import { Particle } from "./Particle";
import { MouseInteraction } from "../physics/MouseInteraction";
import type { MouseState } from "../types/particle-types";
import type { Position } from "../types/particle-types";
import { MOUSE_CONFIG } from "../config/particle-config";

export class ParticleSystem {
  private particles: Particle[] = [];
  private container?: PIXI.ParticleContainer;
  private mouse: MouseState;
  private texture: any;
  private mouseInteraction = new MouseInteraction();
  private canvas?: HTMLCanvasElement; // canvas参照を保持

  constructor(texture: any, canvas?: HTMLCanvasElement) {
    this.texture = texture;
    this.canvas = canvas; // canvas参照を保存
    this.mouse = {
      x: -1000,
      y: -1000,
      radius: MOUSE_CONFIG.radius,
    };
    if (canvas) {
      this.setupEventListeners(canvas);
    }
  }

  createParticles(positions: Position[], stage: PIXI.Container): void {
    if (this.container) {
      this.container.destroy();
      this.particles = [];
    }

    // モバイル対応: パーティクル数を制限
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const maxParticles = 100000;
    const limitedPositions = positions.slice(0, maxParticles);

    if (positions.length > maxParticles) {
      console.warn(
        `パーティクル数を${positions.length}から${maxParticles}に制限 (モバイル対応)`
      );
    }

    this.container = new PIXI.ParticleContainer(maxParticles);

    for (const position of limitedPositions) {
      const particle = new Particle(position, this.texture);
      this.particles.push(particle);
      this.container!.addChild(particle.sprite);
    }

    stage.addChild(this.container);
    console.log(`パーティクル${this.particles.length}個を生成完了`);
  }

  private setupEventListeners(canvas: HTMLCanvasElement): void {
    // タッチデバイス対応: パッシブイベントリスナーを使用
    const options = { passive: true };

    // documentレベルでマウス/タッチを追跡
    document.addEventListener(
      "pointermove",
      this.onDocumentMove.bind(this),
      options
    );
  }

  private onDocumentMove(e: PointerEvent): void {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();

    // canvas内の相対座標に変換
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  animate() {
    this.mouseInteraction.processAllParticles(this.mouse, this.particles);
  }

  /**
   * 全パーティクルのスケールを設定
   */
  setParticleScale(scale: number): void {
    for (const particle of this.particles) {
      particle.sprite.scale.set(scale);
    }
    console.log(`ParticleSystem: パーティクルスケールを${scale}に設定`);
  }

  /**
   * マウスの影響範囲を設定
   */
  setMouseRadius(radius: number): void {
    this.mouse.radius = radius;
    console.log(`ParticleSystem: マウス影響範囲を${radius}に設定`);
  }

  /**
   * 全パーティクルの色を設定
   */
  setParticleTint(tint: number): void {
    for (const particle of this.particles) {
      particle.sprite.tint = tint;
    }
    console.log(
      `ParticleSystem: パーティクルの色を0x${tint.toString(16)}に設定`
    );
  }

  /**
   * 全パーティクルの物理パラメータを設定
   */
  setPhysicsParams(friction?: number, moveSpeed?: number): void {
    for (const particle of this.particles) {
      particle.setPhysicsParams(friction, moveSpeed);
    }
    console.log(
      `ParticleSystem: 物理パラメータを設定 friction:${friction} moveSpeed:${moveSpeed}`
    );
  }
}
