import * as PIXI from "pixi.js";
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
    // 復元力の計算：元の位置との差分に比例した力を加える
    this.vx += (this.savedX - this.x) * PARTICLE_CONFIG.moveSpeed;
    this.vy += (this.savedY - this.y) * PARTICLE_CONFIG.moveSpeed;

    // 摩擦力の適用：速度を段階的に減衰させる
    this.vx *= PARTICLE_CONFIG.friction;
    this.vy *= PARTICLE_CONFIG.friction;

    // 物理演算による位置の更新
    this.x += this.vx;
    this.y += this.vy;

    // 画面描画位置をパーティクルの論理位置に同期
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
}
