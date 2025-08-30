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

// ガベージコレクション用の型定義
declare global {
  interface Window {
    gc?: () => void;
  }
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
    console.log("リサイズ開始: クリーンアップ実行");

    // 強制的なクリーンアップを実行
    this.forceCleanup(stage);

    // 即座に画像読み込みを開始
    this.text.setImage(
      "/src/image.png",
      TEXT_CONFIG.density,
      stageWidth,
      stageHeight,
      (positions: Position[]) => {
        console.log(`新しいパーティクル座標: ${positions.length}個`);
        // 画像読み込み完了後のコールバック
        this.pos = positions;
        this.createParticles(stage);
      }
    );
  }

  /**
   * 強制的なクリーンアップ処理（リサイズ時用）
   *
   * @param stage - PIXI.jsのメインステージ
   */
  private forceCleanup(stage: PIXI.Container): void {
    console.log(
      `クリーンアップ前: パーティクル${this.particles.length}個, コンテナ: ${
        this.container ? "true" : "false"
      }`
    );

    // 1. アニメーションを停止するためパーティクル配列を即座クリア
    this.particles = [];
    this.pos = [];

    // 2. コンテナの完全な削除
    if (this.container) {
      try {
        // コンテナ内の全ての子要素を手動で削除
        while (this.container.children.length > 0) {
          const child = this.container.children[0];
          this.container.removeChild(child);
          if (child.destroy) {
            child.destroy();
          }
        }

        // ステージからコンテナを削除
        if (this.container.parent) {
          this.container.parent.removeChild(this.container);
        }

        // コンテナを破棄
        this.container.destroy({
          children: true,
          texture: false,
          baseTexture: false,
        });

        this.container = undefined;
        console.log("コンテナを強制破棄しました");
      } catch (error) {
        console.warn("コンテナ破棄中にエラー:", error);
        this.container = undefined;
      }
    }

    // 3. ステージの全ての子要素をチェックして残留を削除
    const childrenToRemove = [];
    for (let i = stage.children.length - 1; i >= 0; i--) {
      const child = stage.children[i];
      if (child instanceof PIXI.ParticleContainer) {
        childrenToRemove.push(child);
      }
    }

    childrenToRemove.forEach((child) => {
      try {
        stage.removeChild(child);
        child.destroy({ children: true, texture: false, baseTexture: false });
        console.log("orphanコンテナを削除しました");
      } catch (error) {
        console.warn("orphanコンテナ削除中にエラー:", error);
      }
    });

    // 4. メモリクリーンアップ
    if (typeof window !== "undefined" && window.gc) {
      window.gc();
    }

    console.log("強制クリーンアップ完了");
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
    // パーティクル配列の安全性チェック
    if (!this.particles || this.particles.length === 0) {
      return; // パーティクルがない場合は早期リターン
    }

    // パーティクル配列のコピーを作成（リサイズ中の変更から保護）
    const particles = [...this.particles];

    for (let i = 0; i < particles.length; i++) {
      const item = particles[i];

      // パーティクルの有効性をチェック
      if (!item || !item.sprite || item.sprite.destroyed) {
        continue; // 無効なパーティクルはスキップ
      }

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
