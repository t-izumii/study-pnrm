/**
 * パーティクルシステム全体のビジュアル管理を行うクラス
 *
 * 主な責任：
 * - テキストからパーティクル座標の生成
 * - 個々のパーティクルインスタンスの管理
 * - マウスインタラクションによる物理シミュレーション
 * - PIXI.jsコンテナでの効率的な描画管理
 */

import * as PIXI from "pixi.js";
import { Texture } from "./texture";
import { Particle } from "./particle";
import { TEXT_CONFIG, MOUSE_CONFIG } from "./config";

// ローカル型定義（インポート問題を回避）
interface Position {
  x: number;
  y: number;
}

interface MouseState {
  x: number;
  y: number;
  radius: number;
}

export class Visual {
  // テキスト処理用のインスタンス
  private text: Texture;
  // パーティクル用のテクスチャ
  private texture: PIXI.Texture;
  // 全パーティクルの配列
  private particles: Particle[] = [];
  // PIXI.jsのパーティクルコンテナ（高速描画用）
  private container?: PIXI.ParticleContainer;
  // パーティクルの目標座標配列
  private pos: Position[] = [];
  // マウスの状態
  private mouse: MouseState;

  constructor() {
    this.text = new Texture();
    // パーティクル用の画像テクスチャを読み込み
    this.texture = PIXI.Texture.from("/particle.png");

    // マウス状態を初期化
    this.mouse = {
      x: 0,
      y: 0,
      radius: MOUSE_CONFIG.radius,
    };

    this.setupEventListeners();
  }

  /**
   * マウス・ポインターイベントリスナーを設定
   * デスクトップとタッチデバイス両方に対応
   */
  private setupEventListeners(): void {
    document.addEventListener("pointermove", this.onMove.bind(this), false);
  }

  /**
   * パーティクルシステムを表示・更新する
   *
   * 処理の流れ：
   * 1. 前回のコンテナがあれば削除
   * 2. テキストからパーティクル座標を生成
   * 3. PIXI.jsのParticleContainerを作成（高性能描画用）
   * 4. 各座標にパーティクルインスタンスを配置
   *
   * @param stageWidth - ステージの幅
   * @param stageHeight - ステージの高さ
   * @param stage - PIXI.jsのメインステージ
   */
  show(stageWidth: number, stageHeight: number, stage: PIXI.Container): void {
    // 既存のコンテナを削除（メモリリーク防止）
    if (this.container) {
      stage.removeChild(this.container);
    }

    // テキストからパーティクル配置座標を非同期で生成
    this.text.setImage(
      "/src/image.png",
      TEXT_CONFIG.density,
      stageWidth,
      stageHeight,
      (positions: Position[]) => {
        // 画像読み込み完了後のコールバック
        this.pos = positions;
        this.createParticles(stage);
      }
    );
  }

  /**
   * パーティクルを作成してステージに追加
   * 
   * @param stage - PIXI.jsのメインステージ
   */
  private createParticles(stage: PIXI.Container): void {
    // パーティクル専用コンテナを作成
    // 大量のスプライトを効率的に描画するためのPIXI.js機能
    this.container = new PIXI.ParticleContainer(
      this.pos.length, // 最大パーティクル数
      {
        vertices: false, // 頂点変形無効（高速化）
        position: true, // 位置変更有効
        rotation: false, // 回転無効（高速化）
        scale: false, // スケール変更無効（高速化）
        uvs: false, // UV座標変更無効（高速化）
        tint: false, // ティント変更無効（高速化）
      }
    );

    // メインステージにコンテナを追加
    stage.addChild(this.container);

    // 各座標にパーティクルインスタンスを作成・配置
    this.particles = [];
    for (let i = 0; i < this.pos.length; i++) {
      const item = new Particle(this.pos[i], this.texture);
      this.container.addChild(item.sprite);
      this.particles.push(item);
    }

    console.log(`${this.particles.length}個のパーティクルが生成されました`);
  }

  /**
   * フレームごとのアニメーション更新処理
   *
   * マウスインタラクションの物理計算：
   * 1. 各パーティクルとマウス位置の距離を計算
   * 2. 影響範囲内の場合、反発力を適用
   * 3. 反発ベクトルをパーティクルの速度に加算
   * 4. パーティクルの物理更新と描画を実行
   */
  animate(): void {
    for (let i = 0; i < this.particles.length; i++) {
      const item = this.particles[i];

      // マウスとパーティクル間の距離ベクトルを計算
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

  /**
   * マウス・ポインター移動イベントハンドラ
   * クライアント座標（ブラウザウィンドウ基準）でマウス位置を更新
   *
   * @param e - PointerEventオブジェクト
   */
  private onMove(e: PointerEvent): void {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  /**
   * メモリリークを防ぐためのクリーンアップ処理
   * アプリケーション終了時やコンポーネント破棄時に呼び出し
   */
  destroy(): void {
    document.removeEventListener("pointermove", this.onMove.bind(this), false);
    console.log("Visualクラスが破棄されました");
  }
}
