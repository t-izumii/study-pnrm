import * as PIXI from "pixi.js";
import { ParticleSystem } from "./ParticleSystem";
import { TextureGenerator } from "./TextureGenerator";
import { FilterManager } from "./FilterManager";
import { FontLoader } from "../utils/FontLoader";
import type { ParticleAppOptions } from "../types/particle-types";
import {
  PARTICLE_GENERATION_CONFIG,
  PARTICLE_CONFIG,
  RENDERER_CONFIG,
  MOUSE_CONFIG,
  FILTER_CONFIG,
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

      // Google Fontの読み込み（指定されている場合）
      await this.loadFontIfRequired();

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
   * オプションでGoogle Fontが指定されている場合のみ読み込み
   */
  private async loadFontIfRequired(): Promise<void> {
    const fontConfig = this.extractFontConfig();
    if (fontConfig.googleFont) {
      console.log(`Google Font読み込み中: ${fontConfig.googleFont.familyName}`);
      await FontLoader.loadFont(fontConfig.googleFont);
    }
  }

  /**
   * オプションからフォント設定を抽出して正規化
   */
  private extractFontConfig() {
    const { font } = this.options;
    
    // 文字列で指定された場合（既存互換性）
    if (typeof font === 'string') {
      return {
        familyName: font,
        googleFont: null
      };
    }
    
    // オブジェクトで指定された場合
    if (font && typeof font === 'object') {
      if (font.googleFont) {
        return {
          familyName: font.googleFont.familyName,
          googleFont: font.googleFont
        };
      } else if (font.family) {
        return {
          familyName: font.family,
          googleFont: null
        };
      }
    }
    
    // デフォルトフォント
    return {
      familyName: 'Arial',
      googleFont: null
    };
  }

  /**
   * ブレイクポイントに基づいて現在の設定値を取得
   */
  private getCurrentSettings(currentWidth: number) {
    console.log(`getCurrentSettings: 指定された幅 = ${currentWidth}px (window.innerWidth = ${window.innerWidth}px)`);
    
    const baseSettings = {
      density: this.options.density ?? PARTICLE_GENERATION_CONFIG.density,
      scale: this.options.scale ?? PARTICLE_CONFIG.scale * 10,
      blur: this.options.blur,
      size: this.options.size ?? 100,
      mouseRadius: this.options.mouseRadius ?? MOUSE_CONFIG.radius,
      friction: this.options.friction ?? PARTICLE_CONFIG.friction,
      moveSpeed: this.options.moveSpeed ?? PARTICLE_CONFIG.moveSpeed,
      // colorを優先し、なければtint、最後にデフォルト
      color: this.options.color ?? this.options.tint ?? PARTICLE_CONFIG.tint,
      threshold: this.options.threshold ?? FILTER_CONFIG.threshold
    };
    
    console.log('ベース設定:', baseSettings);

    // ブレイクポイントが設定されていない場合はベース設定を返す
    if (!this.options.breakpoints) {
      console.log('ブレイクポイント設定がありません');
      return baseSettings;
    }
    
    console.log('ブレイクポイント設定:', this.options.breakpoints);

    // ブレイクポイントを幅の昇順でソート
    const sortedBreakpoints = Object.keys(this.options.breakpoints)
      .map(Number)
      .sort((a, b) => a - b);
      
    console.log('ソート済みブレイクポイント:', sortedBreakpoints);

    // 現在の幅に適用されるブレイクポイントを検索
    let activeBreakpoint: number | null = null;
    for (const breakpoint of sortedBreakpoints) {
      console.log(`チェック: ${currentWidth} >= ${breakpoint} = ${currentWidth >= breakpoint}`);
      if (currentWidth >= breakpoint) {
        activeBreakpoint = breakpoint;
      } else {
        break;
      }
    }
    
    console.log(`アクティブブレイクポイント: ${activeBreakpoint}`);

    // アクティブなブレイクポイントがある場合は設定をマージ
    if (activeBreakpoint !== null) {
      const breakpointSettings = this.options.breakpoints[activeBreakpoint];
      console.log(`ブレイクポイント ${activeBreakpoint}px を適用:`, breakpointSettings);
      
      const finalSettings = {
        density: breakpointSettings.density ?? baseSettings.density,
        scale: breakpointSettings.scale ?? baseSettings.scale,
        blur: breakpointSettings.blur ?? baseSettings.blur,
        size: breakpointSettings.size ?? baseSettings.size,
        mouseRadius: breakpointSettings.mouseRadius ?? baseSettings.mouseRadius,
        friction: breakpointSettings.friction ?? baseSettings.friction,
        moveSpeed: breakpointSettings.moveSpeed ?? baseSettings.moveSpeed,
        // ブレイクポイントでもcolorを優先
        color: breakpointSettings.color ?? breakpointSettings.tint ?? baseSettings.color,
        threshold: breakpointSettings.threshold ?? baseSettings.threshold
      };
      
      console.log('最終設定:', finalSettings);
      return finalSettings;
    }

    console.log('ブレイクポイントが適用されません、ベース設定を使用');
    return baseSettings;
  }

  /**
   * hex色かRGB成分を抽出 (0-1の範囲)
   */
  private hexToRgb(hex: number): { r: number; g: number; b: number } {
    const r = ((hex >> 16) & 255) / 255;
    const g = ((hex >> 8) & 255) / 255;
    const b = (hex & 255) / 255;
    return { r, g, b };
  }

  /**
   * 現在の設定をパーティクルシステムに適用
   */
  private applyCurrentSettings(settings: any): void {
    // ブラー強度を設定
    if (settings.blur !== undefined) {
      this.setBlurStrength(settings.blur);
    }

    // 闾値を設定
    if (settings.threshold !== undefined) {
      this.setThreshold(settings.threshold);
    }

    // マウス影響範囲を設定
    if (settings.mouseRadius !== undefined) {
      this.setMouseRadius(settings.mouseRadius);
    }

    // パーティクルの色を設定（閾値フィルターの色として）
    if (settings.color !== undefined) {
      this.setColor(settings.color);
    }

    // 物理パラメータを設定
    if (settings.friction !== undefined || settings.moveSpeed !== undefined) {
      this.setPhysicsParams(settings.friction, settings.moveSpeed);
    }
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
    const canvas = this.app?.view as HTMLCanvasElement;
    this.particleSystem = new ParticleSystem(texture, canvas);
    this.textureGenerator = new TextureGenerator();
    console.log("ParticleApp: パーティクルシステム初期化完了");
  }

  private async generateParticlesFromOptions(): Promise<void> {
    if (!this.app || !this.particleSystem || !this.textureGenerator) {
      throw new Error("必要なコンポーネントが初期化されていません");
    }

    const width = this.app.renderer.width;
    const height = this.app.renderer.height;

    const imageWidth = this.options.width || width;
    const imageHeight = this.options.height || height;

    // ブレイクポイントを考慮した設定値を取得（window.widthで比較）
    const currentSettings = this.getCurrentSettings(window.innerWidth);
    const particleScale = currentSettings.scale * 0.1;

    if (this.options.type === "text") {
      const fontSize = currentSettings.size; // ブレイクポイント対応サイズ
      const fontConfig = this.extractFontConfig();
      const fontFamily = fontConfig.familyName;
      const fontWeight = this.options.weight || "normal";
      const text = this.options.text || "TEST";

      const fontString = `${fontWeight} ${fontSize}px "${fontFamily}"`;
      console.log(`使用するフォント文字列: ${fontString}`);

      const positions = this.textureGenerator.setTextWithFont(
        text,
        fontString,
        currentSettings.density,
        width,
        height
      );

      console.log(`ParticleApp: ${positions.length}個のパーティクル座標を生成`);

      // パーティクル作成
      this.particleSystem.createParticles(positions, this.app.stage);
      
      // スケールを設定（ブレイクポイント対応）
      this.particleSystem.setParticleScale(particleScale);

      // アニメーションループ開始
      this.startAnimationLoop();
      
      // 設定を適用
      this.applyCurrentSettings(currentSettings);
    } else if (this.options.type === "image") {
      // 画像処理を追加
      if (!this.options.imageSrc) {
        throw new Error("画像パスが指定されていません");
      }

      return new Promise((resolve, reject) => {
        this.textureGenerator!.setImage(
          this.options.imageSrc!,
          currentSettings.density,
          imageWidth,
          imageHeight,
          (positions) => {
            console.log(
              `ParticleApp: 画像から${positions.length}個のパーティクル座標を生成`
            );

            this.particleSystem!.createParticles(positions, this.app!.stage);

            // スケールを設定（ブレイクポイント対応）
            this.particleSystem!.setParticleScale(particleScale);

            this.startAnimationLoop();
            
            // 設定を適用
            this.applyCurrentSettings(currentSettings);
            
            resolve();
          }
        );
      });
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
   * 闾値フィルターの闾値を変更
   */
  setThreshold(threshold: number): void {
    if (!this.filterManager) {
      console.warn("FilterManagerが初期化されていません");
      return;
    }
    this.filterManager.setThreshold(threshold);
  }

  /**
   * パーティクルの色を変更 (推奨)
   */
  setColor(color: number): void {
    if (!this.filterManager) {
      console.warn("FilterManagerが初期化されていません");
      return;
    }
    this.filterManager.setColor(color);
  }

  /**
   * パーティクルの色を変更 (非推奨 - 互換性のため)
   */
  setParticleTint(tint: number): void {
    if (!this.particleSystem) {
      console.warn("ParticleSystemが初期化されていません");
      return;
    }
    this.particleSystem.setParticleTint(tint);
  }

  /**
   * マウス影響範囲を変更
   */
  setMouseRadius(radius: number): void {
    if (!this.particleSystem) {
      console.warn("ParticleSystemが初期化されていません");
      return;
    }
    this.particleSystem.setMouseRadius(radius);
  }

  /**
   * 物理パラメータを変更
   */
  setPhysicsParams(friction?: number, moveSpeed?: number): void {
    if (!this.particleSystem) {
      console.warn("ParticleSystemが初期化されていません");
      return;
    }
    this.particleSystem.setPhysicsParams(friction, moveSpeed);
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

    this.resizeDebounceId = window.setTimeout(async () => {
      await this.resize();
    }, 100);
  }

  /**
   * リサイズ処理とパーティクル再生成
   */
  async resize(width?: number, height?: number): Promise<void> {
    if (!this.app) {
      console.warn("PIXI.jsアプリケーションが初期化されていません");
      return;
    }

    let newWidth: number;
    let newHeight: number;

    if (width !== undefined && height !== undefined) {
      // 明示的にサイズが指定された場合
      newWidth = width;
      newHeight = height;
    } else {
      // コンテナ要素のサイズを取得
      if (this.containerElement) {
        const rect = this.containerElement.getBoundingClientRect();
        newWidth = rect.width || window.innerWidth;
        newHeight = rect.height || window.innerHeight;
      } else {
        // フォールバック: window サイズを使用
        newWidth = window.innerWidth;
        newHeight = window.innerHeight;
      }
    }

    // PIXIアプリケーションリサイズ
    this.app.renderer.resize(newWidth, newHeight);

    // パーティクルを新しいサイズで再生成
    await this.regenerateParticles();

    console.log(`ParticleApp: リサイズ完了 ${newWidth}x${newHeight}`);
  }

  /**
   * パーティクルを現在のオプションで再生成
   */
  private async regenerateParticles(): Promise<void> {
    if (!this.textureGenerator || !this.particleSystem || !this.app) {
      return;
    }

    const width = this.app.renderer.width;
    const height = this.app.renderer.height;
    
    // ブレイクポイントを考慮した設定値を取得（window.widthで比較）
    const currentSettings = this.getCurrentSettings(window.innerWidth);
    const particleScale = currentSettings.scale * 0.1;

    if (this.options.type === "text") {
      const fontSize = currentSettings.size;
      const fontConfig = this.extractFontConfig();
      const fontFamily = fontConfig.familyName;
      const fontWeight = this.options.weight || "normal";
      const text = this.options.text || "TEST";

      const fontString = `${fontWeight} ${fontSize}px "${fontFamily}"`;
      console.log(`リサイズ時のフォント文字列: ${fontString}`);

      const positions = this.textureGenerator.setTextWithFont(
        text,
        fontString,
        currentSettings.density,
        width,
        height
      );

      console.log(
        `ParticleApp: リサイズ時に${positions.length}個のパーティクルを再生成`
      );
      this.particleSystem.createParticles(positions, this.app.stage);
      this.particleSystem.setParticleScale(particleScale);
      
      // 設定を適用
      this.applyCurrentSettings(currentSettings);
    } else if (this.options.type === "image" && this.options.imageSrc) {
      const imageWidth = this.options.width || width;
      const imageHeight = this.options.height || height;

      this.textureGenerator.setImage(
        this.options.imageSrc,
        currentSettings.density,
        imageWidth,
        imageHeight,
        (positions) => {
          console.log(
            `ParticleApp: リサイズ時に画像から${positions.length}個のパーティクルを再生成`
          );
          this.particleSystem!.createParticles(positions, this.app!.stage);
          this.particleSystem!.setParticleScale(particleScale);
          
          // 設定を適用
          this.applyCurrentSettings(currentSettings);
        }
      );
    }
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
