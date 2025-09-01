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
      x: 0,
      y: 0,
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

    this.container = new PIXI.ParticleContainer(50000);

    for (const position of positions) {
      const particle = new Particle(position, this.texture);
      this.particles.push(particle);
      this.container!.addChild(particle.sprite);
    }

    stage.addChild(this.container);
  }

  private setupEventListeners(canvas: HTMLCanvasElement): void {
    canvas.addEventListener("pointermove", this.onMove.bind(this), false);
    canvas.addEventListener("pointerleave", this.onLeave.bind(this), false);
    canvas.addEventListener("pointerout", this.onLeave.bind(this), false);
    
    // documentレベルでもマウスを追跡（確実なフォールバック）
    document.addEventListener("pointermove", this.onDocumentMove.bind(this), false);
  }

  private onMove(e: PointerEvent) {
    const canvas = e.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    // canvas内の相対座標に変換
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  }

  private onLeave(e: PointerEvent): void {
    // マウスが抜けた方向を計算して、その方向に移動し続ける
    const canvas = e.currentTarget as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    
    // canvas外の座標を計算（実際のマウス位置）
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // マウス座標をそのまま更新（canvas外でも）
    this.mouse.x = mouseX;
    this.mouse.y = mouseY;
    
    console.log(`マウスがcanvas外に移動: (${mouseX}, ${mouseY})`);
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
}
