import * as PIXI from "pixi.js";
import { ParticleSystem } from "./ParticleSystem";
import { TextureGenerator } from "./TextureGenerator";
import { FilterManager } from "./FilterManager";
import type { ParticleAppOptions } from "../types/particle-types";
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
  private containerSelector: string;
  private containerElement?: HTMLElement;
  private options: ParticleAppOptions;
  private app?: PIXI.Application;
  private filterManager?: FilterManager;
  private particleSystem?: ParticleSystem;
  private textureGenerator?: TextureGenerator;
  private currentSelector: string = "[data-particle]";
  private resizeDebounceId?: number;

  constructor(containerSelector: string, options: ParticleAppOptions) {
    this.containerSelector = containerSelector;
    this.options = options;

    this.initialize();
  }

  /**
   * アプリケーション全体を初期化
   *
   * @param selector HTMLセレクター（デフォルト: "[data-particle]"）
   */
  async initialize(): Promise<void> {
    try {
      console.log("ParticleApp: 初期化開始...");

      this.findContainerElement();

      // PIXI.jsアプリケーション初期化
      this.setupPixiApp();

      // フィルター管理初期化・適用
      this.setupFilters();

      // パーティクルシステム初期化
      this.setupParticleSystem();

      // HTMLからパーティクル生成・アニメーション開始
      await this.generateParticlesFromOptions();

      // リサイズイベントリスナーを設定
      this.setupResizeListener();

      console.log("ParticleApp: 初期化完了！");
    } catch (error) {
      console.error("ParticleApp初期化中にエラーが発生しました:", error);
      throw error;
    }
  }

  private findContainerElement(): void {
    this.containerElement = document.querySelector(this.containerSelector);
  }

  /**
   * PIXI.jsアプリケーションの初期化
   */
  private setupPixiApp(): void {
    if (!this.containerElement) {
      throw new Error("コンテナ要素が設定されていません");
    }

    // コンテナ要素のサイズを取得
    const rect = this.containerElement.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    const config: any = {
      width,
      height,
      ...RENDERER_CONFIG,
      backgroundAlpha: 0,
    };

    this.app = new PIXI.Application(config);

    // 指定されたコンテナ要素に追加
    this.containerElement.appendChild(this.app.view as HTMLCanvasElement);
    console.log(
      `ParticleApp: PIXI.jsアプリケーション初期化完了 (${width}x${height})`
    );
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

  private async generateParticlesFromOptions(): Promise<void> {
    if (!this.app || !this.particleSystem || !this.textureGenerator) {
      throw new Error("必要なコンポーネントが初期化されていません");
    }

    const width = this.app.renderer.width;
    const height = this.app.renderer.height;

    if (this.options.type === "text") {
      const fontSize = this.options.size || 100;
      const fontFamily = this.options.font || "Arial";
      const fontWeight = this.options.weight || "normal";
      const text = this.options.text || "TEST";

      const fontString = `${fontWeight} ${fontSize}px ${fontFamily}`;

      const positions = this.textureGenerator.setTextWithFont(
        text,
        fontString,
        PARTICLE_GENERATION_CONFIG.density,
        width,
        height
      );

      console.log(`ParticleApp: ${positions.length}個のパーティクル座標を生成`);

      // パーティクル作成
      this.particleSystem.createParticles(positions, this.app.stage);

      // アニメーションループ開始
      this.startAnimationLoop();
    } else if (this.options.type === "image") {
      // 画像処理は後で実装
      throw new Error("画像タイプは未実装です");
    }
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
