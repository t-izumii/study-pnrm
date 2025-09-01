import * as PIXI from "pixi.js";
import { PhysicsEngine } from "../physics/PhysicsEngine";
import type { Position } from "../types/particle-types";
import { PARTICLE_CONFIG } from "../config/particle-config";

/**
 * 個々のパーティクルの動作を管理するクラス
 *
 * 1個のパーティクルの物理シミュレーションを担当し、
 * バネのような復元力で元の形を維持する動作を実現する。
 */
export class Particle {
  sprite: PIXI.Sprite;
  savedX: number;
  savedY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  private physicsEngine = new PhysicsEngine();

  constructor(pos: Position, texture: any) {
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.scale.set(PARTICLE_CONFIG.scale);
    this.sprite.tint = PARTICLE_CONFIG.tint;

    this.savedX = pos.x; // 元の位置（X座標）
    this.savedY = pos.y; // 元の位置（Y座標）

    this.x = pos.x; // 現在のパーティクル位置（X座標）
    this.y = pos.y; // 現在のパーティクル位置（Y座標）

    this.sprite.x = this.x; // スプライトが画面上で実際に描画される位置（X座標）
    this.sprite.y = this.y; // スプライトが画面上で実際に描画される位置（Y座標）

    this.vx = 0; // X方向の速度
    this.vy = 0; // Y方向の速度
  }

  draw() {
    this.physicsEngine.updatePhysics(this);
  }

  /**
   * 物理パラメータを動的に設定
   */
  setPhysicsParams(friction?: number, moveSpeed?: number): void {
    this.physicsEngine.setParams(friction, moveSpeed);
  }
}
