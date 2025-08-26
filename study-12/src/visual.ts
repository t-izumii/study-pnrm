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
import { Text } from "./text";
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
  private text: Text;
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
  // マウスの前回位置（移動方向計算用）
  private prevMouse: { x: number; y: number };

  constructor() {
    this.text = new Text();
    // パーティクル用の画像テクスチャを読み込み
    this.texture = PIXI.Texture.from('/particle.png');

    // マウス状態を初期化
    this.mouse = {
      x: 0,
      y: 0,
      radius: MOUSE_CONFIG.radius,
    };
    
    // マウスの前回位置を初期化
    this.prevMouse = { x: 0, y: 0 };

    this.setupEventListeners();
  }

  /**
   * マウス・ポインターイベントリスナーを設定
   * デスクトップとタッチデバイス両方に対応
   */
  private setupEventListeners(): void {
    document.addEventListener('pointermove', this.onMove.bind(this), false);
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

    // テキストからパーティクル配置座標を生成
    this.pos = this.text.setText(TEXT_CONFIG.defaultText, TEXT_CONFIG.density, stageWidth, stageHeight);
    
    // パーティクル専用コンテナを作成
    // 大量のスプライトを効率的に描画するためのPIXI.js機能
    this.container = new PIXI.ParticleContainer(
      this.pos.length, // 最大パーティクル数
      {
        vertices: false,   // 頂点変形無効（高速化）
        position: true,    // 位置変更有効
        rotation: false,   // 回転無効（高速化）
        scale: false,      // スケール変更無効（高速化）
        uvs: false,        // UV座標変更無効（高速化）
        tint: false,       // ティント変更無効（高速化）
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

      // マウスの影響範囲内にある場合、マウスの移動方向に反発
      if (dist < minDist) {
        // マウスの移動ベクトルを計算
        const mouseDx = this.mouse.x - this.prevMouse.x;
        const mouseDy = this.mouse.y - this.prevMouse.y;
        const mouseSpeed = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
        
        // マウスが移動している場合のみ反発を適用
        if (mouseSpeed > 0.5) { // 最小移動量の闾値
          // 距離に応じた反発の強さ
          const forceStrength = (minDist - dist) / minDist * mouseSpeed * 0.8;
          
          // マウスの移動方向に正規化
          const moveDirectionX = mouseDx / mouseSpeed;
          const moveDirectionY = mouseDy / mouseSpeed;
          
          // マウスの移動方向にパーティクルを反発させる
          item.vx += moveDirectionX * forceStrength;
          item.vy += moveDirectionY * forceStrength;
        }
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
    // 前回のマウス位置を保存
    this.prevMouse.x = this.mouse.x;
    this.prevMouse.y = this.mouse.y;
    
    // 現在のマウス位置を更新
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  /**
   * メモリリークを防ぐためのクリーンアップ処理
   * アプリケーション終了時やコンポーネント破棄時に呼び出し
   */
  destroy(): void {
    document.removeEventListener('pointermove', this.onMove.bind(this), false);
    console.log('Visualクラスが破棄されました');
  }
}
