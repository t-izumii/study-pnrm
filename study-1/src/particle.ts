/**
 * 個々のパーティクルの動作を管理するクラス
 * 
 * 主な機能：
 * - PIXI.Spriteとしてのパーティクル描画
 * - 物理シミュレーション（慣性、摩擦、復元力）
 * - マウスとの相互作用による動的な動き
 */

import * as PIXI from "pixi.js";
import { PARTICLE_CONFIG } from "./config";

// ローカル型定義（インポート問題を回避）
interface Position {
  x: number;
  y: number;
}

export class Particle {
  // PIXI.jsスプライト（実際に画面に描画される要素）
  sprite: PIXI.Sprite;
  
  // 元の位置（パーティクルが戻ろうとする目標位置）
  savedX: number;
  savedY: number;
  
  // 現在の位置
  x: number;
  y: number;
  
  // 速度ベクトル（物理シミュレーション用）
  vx: number;
  vy: number;
  
  // 衝突判定用の半径
  radius: number;

  /**
   * パーティクルを初期化
   * @param pos - 初期位置とパーティクルが戻る目標位置
   * @param texture - パーティクルに適用するテクスチャ
   */
  constructor(pos: Position, texture: PIXI.Texture) {
    // スプライトを作成し、見た目を設定
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.scale.set(PARTICLE_CONFIG.scale);
    this.sprite.tint = PARTICLE_CONFIG.tint;

    // 位置の初期化（元の位置と現在位置を同じに設定）
    this.savedX = pos.x;
    this.savedY = pos.y;
    this.x = pos.x;
    this.y = pos.y;
    this.sprite.x = this.x;
    this.sprite.y = this.y;

    // 物理パラメータの初期化
    this.vx = 0;  // X方向の速度
    this.vy = 0;  // Y方向の速度
    this.radius = PARTICLE_CONFIG.radius;
  }

  /**
   * フレームごとに呼び出される描画・物理更新メソッド
   * 
   * 物理シミュレーションの流れ：
   * 1. 復元力の計算（元の位置に戻ろうとする力）
   * 2. 摩擦力の適用（動きを減衰させる）
   * 3. 速度による位置の更新
   * 4. スプライトの描画位置を更新
   */
  draw(): void {
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
