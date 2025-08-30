import * as PIXI from "pixi.js";
import { ParticleSystem } from "./ParticleSystem";
import { TextureGenerator } from "./TextureGenerator";
import { FilterManager } from "./FilterManager";
import {
  PARTICLE_GENERATION_CONFIG,
  RENDERER_CONFIG,
} from "../config/particle-config";

/**
 * パーティクルアプリケーション全体を管理するクラス
 *
 * 主な責任：
 * - PIXI.jsアプリケーションの初期化
 * - フィルター管理
 * - パーティクルシステムの統合管理
 * - HTMLからのパーティクル生成
 * - アニメーションループの制御
 */
export class ParticleApp {
  private app?: PIXI.Application;
  private filterManager?: FilterManager;
  private particleSystem?: ParticleSystem;
  private textureGenerator?: TextureGenerator;
  private currentSelector: string = "[data-particle]";
  private resizeDebounceId?: number;

  constructor() {}

  /**
   * アプリケーション全体を初期化
   *
   * @param selector HTMLセレクター（デフォルト: "[data-particle]"）
   */
  async initialize(selector: string = "[data-particle]"): Promise<void> {
    try {
      console.log("ParticleApp: 初期化開始...");

      // PIXI.jsアプリケーション初期化
      this.setupPixiApp();

      // フィルター管理初期化・適用
      this.setupFilters();

      // パーティクルシステム初期化
      this.setupParticleSystem();

      // HTMLからパーティクル生成・アニメーション開始
      await this.generateParticlesFromHTML(selector);

      // リサイズイベントリスナーを設定
      this.setupResizeListener();

      console.log("ParticleApp: 初期化完了！");
    } catch (error) {
      console.error("ParticleApp初期化中にエラーが発生しました:", error);
      throw error;
    }
  }

  /**
   * PIXI.jsアプリケーションの初期化
   */
  private setupPixiApp(): void {
    const config: any = {
      width: window.innerWidth,
      height: window.innerHeight,
      ...RENDERER_CONFIG,
      backgroundAlpha: 0,
    };

    this.app = new PIXI.Application(config);

    document.body.appendChild(this.app.view as HTMLCanvasElement);
    console.log("ParticleApp: PIXI.jsアプリケーション初期化完了");
  }

  /**
   * フィルター管理の初期化・適用
   */
  private setupFilters(): void {
    if (!this.app) {
      throw new Error("PIXI.jsアプリケーションが初期化されていません");
    }

    this.filterManager = new FilterManager();
    this.filterManager.applyAdvancedFiltersToStage(
      this.app.stage,
      this.app.renderer
    );
    console.log("ParticleApp: フィルター適用完了");
  }

  /**
   * パーティクルシステムの初期化
   */
  private setupParticleSystem(): void {
    const texture = PIXI.Texture.WHITE;
    this.particleSystem = new ParticleSystem(texture);
    this.textureGenerator = new TextureGenerator();
    console.log("ParticleApp: パーティクルシステム初期化完了");
  }

  /**
   * HTMLからパーティクル生成とアニメーション開始
   */
  private async generateParticlesFromHTML(selector: string): Promise<void> {
    if (!this.app || !this.particleSystem || !this.textureGenerator) {
      throw new Error("必要なコンポーネントが初期化されていません");
    }

    // 現在のセレクターを保存
    this.currentSelector = selector;

    return new Promise((resolve, reject) => {
      this.textureGenerator!.generateFromHTMLSelector(
        selector,
        PARTICLE_GENERATION_CONFIG.density,
        window.innerWidth,
        window.innerHeight,
        (positions) => {
          try {
            console.log(
              `ParticleApp: ${positions.length}個のパーティクル座標を生成`
            );

            // パーティクル作成
            this.particleSystem!.createParticles(positions, this.app!.stage);

            // アニメーションループ開始
            this.startAnimationLoop();

            console.log("ParticleApp: アニメーション開始");
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * アニメーションループの開始
   */
  private startAnimationLoop(): void {
    if (!this.app || !this.particleSystem) {
      throw new Error(
        "アプリケーションまたはパーティクルシステムが初期化されていません"
      );
    }

    this.app.ticker.add(() => {
      this.particleSystem!.animate();
    });
  }

  /**
   * ブラー強度を変更
   */
  setBlurStrength(blur: number): void {
    if (!this.filterManager) {
      console.warn("FilterManagerが初期化されていません");
      return;
    }
    this.filterManager.setBlurStrength(blur);
  }

  /**
   * フィルター設定をリセット
   */
  resetFilters(): void {
    if (!this.filterManager) {
      console.warn("FilterManagerが初期化されていません");
      return;
    }
    this.filterManager.resetToDefaults();
  }

  /**
   * 基本ブラーフィルターのみ適用
   */
  useSimpleBlur(): void {
    if (!this.filterManager || !this.app) {
      console.warn("必要なコンポーネントが初期化されていません");
      return;
    }
    this.filterManager.applyToStage(this.app.stage, this.app.renderer);
  }

  /**
   * 高度なフィルター（ブラー+閾値）を適用
   */
  useAdvancedFilters(): void {
    if (!this.filterManager || !this.app) {
      console.warn("必要なコンポーネントが初期化されていません");
      return;
    }
    this.filterManager.applyAdvancedFiltersToStage(
      this.app.stage,
      this.app.renderer
    );
  }

  /**
   * ウィンドウリサイズイベントリスナーを設定
   */
  private setupResizeListener(): void {
    window.addEventListener("resize", () => {
      this.handleResize();
    });
  }

  /**
   * デバウンス付きリサイズ処理
   */
  private handleResize(): void {
    if (this.resizeDebounceId) {
      clearTimeout(this.resizeDebounceId);
    }

    this.resizeDebounceId = window.setTimeout(() => {
      this.resize();
    }, 100);
  }

  /**
   * リサイズ処理とパーティクル再生成
   */
  resize(width?: number, height?: number): void {
    if (!this.app) {
      console.warn("PIXI.jsアプリケーションが初期化されていません");
      return;
    }

    const newWidth = width || window.innerWidth;
    const newHeight = height || window.innerHeight;

    // PIXIアプリケーションリサイズ
    this.app.renderer.resize(newWidth, newHeight);

    // パーティクルを新しいサイズで再生成
    this.regenerateParticles();

    console.log(`ParticleApp: リサイズ完了 ${newWidth}x${newHeight}`);
  }

  /**
   * パーティクルを現在のウィンドウサイズで再生成
   */
  private regenerateParticles(): void {
    if (!this.textureGenerator || !this.particleSystem || !this.app) {
      return;
    }

    this.textureGenerator.generateFromHTMLSelector(
      this.currentSelector,
      PARTICLE_GENERATION_CONFIG.density,
      window.innerWidth,
      window.innerHeight,
      (positions) => {
        console.log(
          `ParticleApp: リサイズ時に${positions.length}個のパーティクルを再生成`
        );
        this.particleSystem!.createParticles(positions, this.app!.stage);
      }
    );
  }

  /**
   * アプリケーション終了・クリーンアップ
   */
  destroy(): void {
    // リサイズイベントリスナーを削除
    window.removeEventListener("resize", this.handleResize);

    // デバウンスタイマーをクリア
    if (this.resizeDebounceId) {
      clearTimeout(this.resizeDebounceId);
    }

    if (this.app) {
      this.app.destroy(true);
    }
    console.log("ParticleApp: アプリケーション終了");
  }
}
