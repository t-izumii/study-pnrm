import * as PIXI from "pixi.js";
import { ParticleSystem } from "./ParticleSystem";
import { TextureGenerator } from "./TextureGenerator";
import { FilterManager } from "./FilterManager";
import type { ParticleAppOptions } from "../types/particle-types";
import { RENDERER_CONFIG } from "../config/particle-config";
import {
  SettingsManager,
  SettingsApplicator,
  FontManager,
  EventManager,
  type ResolvedSettings,
} from "./managers";

/**
 * パーティクルアプリケーション全体を管理するメインクラス（リファクタリング版）
 *
 * 責任を分離し、各マネージャークラスに処理を委譲する設計に変更：
 * - SettingsManager: 設定値の計算・管理
 * - SettingsApplicator: 設定の適用
 * - FontManager: フォント管理
 * - EventManager: イベント処理
 */
export class ParticleApp {
  // Core components
  private readonly containerSelector: string;
  private readonly options: ParticleAppOptions;
  private containerElement?: HTMLElement;
  private app?: PIXI.Application;

  // System components
  private particleSystem?: ParticleSystem;
  private textureGenerator?: TextureGenerator;
  private filterManager?: FilterManager;

  // Manager components
  private readonly settingsManager: SettingsManager;
  private readonly settingsApplicator: SettingsApplicator;
  private readonly fontManager: FontManager;
  private readonly eventManager: EventManager;

  // State
  private isInitialized = false;

  constructor(containerSelector: string, options: ParticleAppOptions) {
    this.containerSelector = containerSelector;
    this.options = options;

    // マネージャークラスを初期化
    this.settingsManager = new SettingsManager(options);
    this.settingsApplicator = new SettingsApplicator();
    this.fontManager = new FontManager(options);
    this.eventManager = new EventManager();

    // 初期化を非同期で実行
    this.initialize().catch((error) => {
      console.error("ParticleApp初期化中にエラーが発生しました:", error);
    });
  }

  /**
   * アプリケーション全体を初期化
   */
  private async initialize(): Promise<void> {
    try {
      console.log("ParticleApp: 初期化開始...");

      // フォントを読み込み
      await this.fontManager.loadFontIfRequired();

      // DOM要素を取得
      this.findContainerElement();

      // PIXI.js初期化
      this.setupPixiApp();

      // システムコンポーネントを初期化
      this.setupSystemComponents();

      // マネージャーにシステムコンポーネントを設定
      this.connectManagers();

      // パーティクル生成
      await this.generateParticles();

      // イベントリスナーを設定
      this.setupEventListeners();

      this.isInitialized = true;
      console.log("ParticleApp: 初期化完了！");
    } catch (error) {
      console.error("ParticleApp初期化失敗:", error);
      throw error;
    }
  }

  /**
   * DOM要素を取得
   */
  private findContainerElement(): void {
    const element = document.querySelector(this.containerSelector);

    if (!element) {
      throw new Error(`要素が見つかりません: ${this.containerSelector}`);
    }

    this.containerElement = element as HTMLElement;
  }

  /**
   * PIXI.jsアプリケーションの初期化
   */
  private setupPixiApp(): void {
    if (!this.containerElement) {
      throw new Error("コンテナ要素が設定されていません");
    }

    const rect = this.containerElement.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    // モバイル対応: WebGL未対応時のフォールバック設定
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const rendererConfig = {
      ...RENDERER_CONFIG,
      backgroundAlpha: 0,
    };

    // モバイルデバイスでは保守的な設定を使用
    if (isMobile) {
      Object.assign(rendererConfig, {
        resolution: 1, // モバイルでは解像度を1に固定
        antialias: false, // アンチエイリアシングを無効化してパフォーマンス向上
      });
    }

    try {
      this.app = new PIXI.Application({
        width,
        height,
        ...rendererConfig,
      });

      // WebGLコンテキストの確認
      const renderer = this.app.renderer;
      console.log(`PIXI.js初期化完了 (${width}x${height})`);
      console.log(
        `レンダラータイプ: ${
          renderer.type === PIXI.RENDERER_TYPE.WEBGL ? "WebGL" : "Canvas"
        }`
      );

      if (isMobile) {
        console.log("モバイルデバイス用設定を適用");
      }
    } catch (error) {
      console.error("PIXI.js初期化エラー:", error);

      // フォールバック: Canvas2Dレンダラーで再試行
      try {
        console.log("Canvas2Dレンダラーでフォールバック中...");
        this.app = new PIXI.Application({
          width,
          height,
          ...rendererConfig,
          forceCanvas: true,
        });
        console.log("Canvas2Dレンダラーでの初期化完了");
      } catch (fallbackError) {
        console.error("Canvas2Dフォールバックも失敗:", fallbackError);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        throw new Error(`PIXI.js初期化に失敗しました: ${errorMessage}`);
      }
    }

    this.containerElement.appendChild(this.app.view as HTMLCanvasElement);
  }

  /**
   * システムコンポーネントを初期化
   */
  private setupSystemComponents(): void {
    if (!this.app) {
      throw new Error("PIXI.jsアプリケーションが初期化されていません");
    }

    const canvas = this.app.view as HTMLCanvasElement;

    // フィルター管理を初期化
    this.filterManager = new FilterManager();
    this.filterManager.applyAdvancedFiltersToStage(
      this.app.stage,
      this.app.renderer
    );

    // パーティクルシステムを初期化
    this.particleSystem = new ParticleSystem(PIXI.Texture.WHITE, canvas);

    // テクスチャジェネレーターを初期化
    this.textureGenerator = new TextureGenerator();

    console.log("システムコンポーネント初期化完了");
  }

  /**
   * マネージャーとシステムコンポーネントを接続
   */
  private connectManagers(): void {
    if (!this.particleSystem || !this.filterManager) {
      throw new Error("システムコンポーネントが初期化されていません");
    }

    this.settingsApplicator.setParticleSystem(this.particleSystem);
    this.settingsApplicator.setFilterManager(this.filterManager);
  }

  /**
   * パーティクルを生成
   */
  private async generateParticles(): Promise<void> {
    if (!this.app || !this.particleSystem || !this.textureGenerator) {
      throw new Error("必要なコンポーネントが初期化されていません");
    }

    const width = this.app.renderer.width;
    const height = this.app.renderer.height;
    const currentSettings = this.settingsManager.getCurrentSettings(
      window.innerWidth
    );

    // 設定値をデバッグ出力
    this.settingsManager.debugSettings(currentSettings, window.innerWidth);

    // 設定値の妥当性チェック
    if (!this.settingsManager.validateSettings(currentSettings)) {
      console.warn("設定値に無効な値が含まれています", currentSettings);
    }

    if (this.options.type === "text") {
      await this.generateTextParticles(currentSettings, width, height);
    } else if (this.options.type === "image") {
      await this.generateImageParticles(currentSettings, width, height);
    } else {
      throw new Error(`未対応のタイプ: ${this.options.type}`);
    }

    // アニメーションを開始
    this.startAnimationLoop();

    // 設定を適用
    this.settingsApplicator.applySettings(currentSettings);
  }

  /**
   * テキストパーティクルを生成
   */
  private async generateTextParticles(
    settings: ResolvedSettings,
    width: number,
    height: number
  ): Promise<void> {
    const text = this.options.text || "TEST";
    const fontString = this.fontManager.generateFontString(settings.size);

    console.log(`テキストパーティクル生成: "${text}" (${fontString})`);

    const positions = this.textureGenerator!.setTextWithFont(
      text,
      fontString,
      settings.density,
      width,
      height
    );

    console.log(`${positions.length}個のパーティクル座標を生成`);

    this.particleSystem!.createParticles(positions, this.app!.stage);
    this.particleSystem!.setParticleScale(settings.scale * 0.1);
  }

  /**
   * 画像パーティクルを生成
   */
  private async generateImageParticles(
    settings: ResolvedSettings,
    width: number,
    height: number
  ): Promise<void> {
    if (!this.options.imageSrc) {
      throw new Error("画像パスが指定されていません");
    }

    const imageWidth = settings.width || this.options.width || width;
    const imageHeight = this.options.height || height;

    return new Promise<void>((resolve) => {
      this.textureGenerator!.setImage(
        this.options.imageSrc!,
        settings.density,
        imageWidth,
        imageHeight,
        (positions) => {
          console.log(`画像から${positions.length}個のパーティクル座標を生成`);

          this.particleSystem!.createParticles(positions, this.app!.stage);
          this.particleSystem!.setParticleScale(settings.scale * 0.1);

          resolve();
        }
      );
    });
  }

  /**
   * アニメーションループを開始
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

    console.log("アニメーションループ開始");
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    this.eventManager.setupResizeListener(async () => {
      await this.handleResize();
    });
  }

  /**
   * リサイズ処理
   */
  private async handleResize(): Promise<void> {
    if (!this.app || !this.containerElement) {
      return;
    }

    const rect = this.containerElement.getBoundingClientRect();
    const newWidth = rect.width || window.innerWidth;
    const newHeight = rect.height || window.innerHeight;

    // PIXIアプリケーションをリサイズ
    this.app.renderer.resize(newWidth, newHeight);

    // パーティクルを再生成
    await this.regenerateParticles();

    console.log(`リサイズ完了: ${newWidth}x${newHeight}`);
  }

  /**
   * パーティクルを現在の設定で再生成
   */
  private async regenerateParticles(): Promise<void> {
    if (!this.textureGenerator || !this.particleSystem || !this.app) {
      return;
    }

    const width = this.app.renderer.width;
    const height = this.app.renderer.height;
    const currentSettings = this.settingsManager.getCurrentSettings(
      window.innerWidth
    );

    // 設定値をデバッグ出力
    this.settingsManager.debugSettings(currentSettings, window.innerWidth);

    if (this.options.type === "text") {
      await this.regenerateTextParticles(currentSettings, width, height);
    } else if (this.options.type === "image") {
      await this.regenerateImageParticles(currentSettings, width, height);
    }

    // 設定を適用
    this.settingsApplicator.applySettings(currentSettings);
  }

  /**
   * テキストパーティクルを再生成
   */
  private async regenerateTextParticles(
    settings: ResolvedSettings,
    width: number,
    height: number
  ): Promise<void> {
    const text = this.options.text || "TEST";
    const fontString = this.fontManager.generateFontString(settings.size);

    const positions = this.textureGenerator!.setTextWithFont(
      text,
      fontString,
      settings.density,
      width,
      height
    );

    console.log(`リサイズ時に${positions.length}個のパーティクルを再生成`);
    this.particleSystem!.createParticles(positions, this.app!.stage);
    this.particleSystem!.setParticleScale(settings.scale * 0.1);
  }

  /**
   * 画像パーティクルを再生成
   */
  private async regenerateImageParticles(
    settings: ResolvedSettings,
    width: number,
    height: number
  ): Promise<void> {
    if (!this.options.imageSrc) {
      return;
    }

    const imageWidth = settings.width || this.options.width || width;
    const imageHeight = this.options.height || height;

    return new Promise((resolve) => {
      this.textureGenerator!.setImage(
        this.options.imageSrc!,
        settings.density,
        imageWidth,
        imageHeight,
        (positions) => {
          console.log(
            `リサイズ時に画像から${positions.length}個のパーティクルを再生成`
          );
          this.particleSystem!.createParticles(positions, this.app!.stage);
          this.particleSystem!.setParticleScale(settings.scale * 0.1);
          resolve();
        }
      );
    });
  }

  // ========================================
  // パブリック API - 動的設定変更メソッド
  // ========================================

  /**
   * パーティクルの色を変更（推奨）
   */
  setColor(color: number): void {
    this.ensureInitialized();
    this.settingsApplicator.applySingleSetting("color", color);
  }

  /**
   * ブラー強度を変更
   */
  setBlurStrength(blur: number): void {
    this.ensureInitialized();
    this.settingsApplicator.applySingleSetting("blur", blur);
  }

  /**
   * 閾値フィルターの閾値を変更
   */
  setThreshold(threshold: number): void {
    this.ensureInitialized();
    this.settingsApplicator.applySingleSetting("threshold", threshold);
  }

  /**
   * マウス影響範囲を変更
   */
  setMouseRadius(radius: number): void {
    this.ensureInitialized();
    this.settingsApplicator.applySingleSetting("mouseRadius", radius);
  }

  /**
   * 物理パラメータを変更
   */
  setPhysicsParams(friction?: number, moveSpeed?: number): void {
    this.ensureInitialized();

    if (!this.particleSystem) {
      console.warn("ParticleSystemが初期化されていません");
      return;
    }

    this.particleSystem.setPhysicsParams(friction, moveSpeed);
  }

  /**
   * パーティクルの色を変更（非推奨 - 互換性のため）
   */
  setParticleTint(tint: number): void {
    console.warn("setParticleTintは非推奨です。setColorを使用してください。");
    this.setColor(tint);
  }

  // ========================================
  // フィルター制御メソッド（互換性維持）
  // ========================================

  /**
   * フィルター設定をリセット
   */
  resetFilters(): void {
    this.ensureInitialized();

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
    this.ensureInitialized();

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
    this.ensureInitialized();

    if (!this.filterManager || !this.app) {
      console.warn("必要なコンポーネントが初期化されていません");
      return;
    }

    this.filterManager.applyAdvancedFiltersToStage(
      this.app.stage,
      this.app.renderer
    );
  }

  // ========================================
  // サイズ制御メソッド
  // ========================================

  /**
   * 手動でリサイズ処理を実行
   */
  async resize(width?: number, height?: number): Promise<void> {
    if (!this.app) {
      console.warn("PIXI.jsアプリケーションが初期化されていません");
      return;
    }

    let newWidth: number;
    let newHeight: number;

    if (width !== undefined && height !== undefined) {
      newWidth = width;
      newHeight = height;
    } else if (this.containerElement) {
      const rect = this.containerElement.getBoundingClientRect();
      newWidth = rect.width || window.innerWidth;
      newHeight = rect.height || window.innerHeight;
    } else {
      newWidth = window.innerWidth;
      newHeight = window.innerHeight;
    }

    this.app.renderer.resize(newWidth, newHeight);
    await this.regenerateParticles();

    console.log(`手動リサイズ完了: ${newWidth}x${newHeight}`);
  }

  // ========================================
  // ライフサイクル管理
  // ========================================

  /**
   * アプリケーション終了・クリーンアップ
   */
  destroy(): void {
    console.log("ParticleApp: クリーンアップ開始");

    // イベントマネージャーをクリーンアップ
    this.eventManager.destroy();

    // PIXIアプリケーションを破棄
    if (this.app) {
      this.app.destroy(true);
      this.app = undefined;
    }

    // 参照をクリア
    this.particleSystem = undefined;
    this.textureGenerator = undefined;
    this.filterManager = undefined;
    this.containerElement = undefined;

    this.isInitialized = false;
    console.log("ParticleApp: クリーンアップ完了");
  }

  // ========================================
  // デバッグ・ユーティリティメソッド
  // ========================================

  /**
   * 現在の設定情報を取得（デバッグ用）
   */
  getDebugInfo(): object {
    return {
      isInitialized: this.isInitialized,
      containerSelector: this.containerSelector,
      options: this.options,
      currentSettings: this.isInitialized
        ? this.settingsManager.getCurrentSettings(window.innerWidth)
        : null,
      eventListenerCount: this.eventManager.getListenerCount(),
      appSize: this.app
        ? {
            width: this.app.renderer.width,
            height: this.app.renderer.height,
          }
        : null,
    };
  }

  /**
   * 初期化状態をチェック
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error("ParticleAppが初期化されていません");
    }
  }

  /**
   * 初期化完了を待機
   */
  async waitForInitialization(timeout = 5000): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (this.isInitialized) {
          clearInterval(checkInterval);
          clearTimeout(timeoutId);
          resolve();
        }
      }, 50);

      const timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error(`初期化がタイムアウトしました (${timeout}ms)`));
      }, timeout);
    });
  }
}
