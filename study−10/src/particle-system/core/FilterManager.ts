import * as PIXI from "pixi.js";
import { FILTER_CONFIG } from "../config/particle-config";

/**
 * PIXI.jsのフィルター管理を行うクラス
 *
 * 主な責任：
 * - ブラーエフェクトと閾値フィルターの作成
 * - stageへのフィルター適用
 * - フィルター設定の動的変更
 */
export class FilterManager {
  private blurFilter!: PIXI.BlurFilter;
  private thresholdFilter!: PIXI.Filter;

  constructor() {
    this.setupFilters();
  }

  /**
   * ビジュアルエフェクト用のフィルターを設定
   */
  private setupFilters(): void {
    // ブラーフィルターの設定
    this.blurFilter = new PIXI.BlurFilter();
    this.blurFilter.blur = FILTER_CONFIG.blur;
    this.blurFilter.autoFit = true;

    // カスタム閾値フィルター用のシェーダー
    const fragSource = `
    precision mediump float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float threshold;
    uniform float mr;
    uniform float mg;
    uniform float mb;
    void main(void) {
      vec4 color = texture2D(uSampler, vTextureCoord);
      vec3 mcolor = vec3(mr, mg, mb);
      if (color.a > threshold) {
        gl_FragColor = vec4(mcolor, 1.0);
      } else {
        gl_FragColor = vec4(vec3(0.0), 0.0);
      }
    }
    `;

    // シェーダーに渡すユニフォーム変数
    const uniformData = {
      threshold: FILTER_CONFIG.threshold,
      mr: FILTER_CONFIG.mr,
      mg: FILTER_CONFIG.mg,
      mb: FILTER_CONFIG.mb,
    };

    // カスタムフィルターを作成
    this.thresholdFilter = new PIXI.Filter(undefined, fragSource, uniformData);

    console.log("FilterManager: フィルターが設定されました");
  }

  /**
   * stageに基本ブラーフィルターを適用
   */
  applyToStage(stage: PIXI.Container, renderer: any): void {
    stage.filters = [this.blurFilter];
    stage.filterArea = renderer.screen;

    console.log("FilterManager: ブラーフィルターがstageに適用されました");
  }

  /**
   * stageに高度なフィルター（ブラー+閾値）を適用
   */
  applyAdvancedFiltersToStage(stage: PIXI.Container, renderer: any): void {
    // ブラー + 閾値フィルターを適用
    stage.filters = [this.blurFilter, this.thresholdFilter];
    stage.filterArea = renderer.screen;

    console.log(
      "FilterManager: 高度なフィルター（ブラー+閾値）がstageに適用されました"
    );
  }

  /**
   * ブラー強度を変更
   */
  setBlurStrength(blur: number): void {
    this.blurFilter.blur = blur;
    console.log(`FilterManager: ブラー強度を${blur}に設定`);
  }

  /**
   * フィルターの設定をリセット
   */
  resetToDefaults(): void {
    this.blurFilter.blur = FILTER_CONFIG.blur;
    this.thresholdFilter.uniforms.threshold = FILTER_CONFIG.threshold;
    this.thresholdFilter.uniforms.mr = FILTER_CONFIG.mr;
    this.thresholdFilter.uniforms.mg = FILTER_CONFIG.mg;
    this.thresholdFilter.uniforms.mb = FILTER_CONFIG.mb;
  }
}
