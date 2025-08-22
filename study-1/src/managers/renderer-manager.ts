/**
 * PIXI.jsのレンダラーとエフェクト管理を行うクラス
 * 
 * 主な責任：
 * - WebGLレンダラーの初期化と設定
 * - ブラーエフェクトと閾値フィルターの適用
 * - 画面リサイズ対応
 * - レンダリング処理の実行
 */

import * as PIXI from "pixi.js";
import { RENDERER_CONFIG, FILTER_CONFIG } from '../config';

export class RendererManager {
  private renderer: PIXI.Renderer;
  private stage: PIXI.Container;

  constructor() {
    this.stage = new PIXI.Container();
    this.setupRenderer();
    this.setupFilters();
  }

  /**
   * PIXI.jsレンダラーを初期化
   * WebGLを使用してハードウェアアクセラレーションを有効化
   */
  private setupRenderer(): void {
    this.renderer = new PIXI.Renderer({
      width: document.body.clientWidth,
      height: document.body.clientHeight,
      ...RENDERER_CONFIG,
    });
    
    // レンダラーのcanvas要素をDOMに追加
    document.body.appendChild(this.renderer.view as any);
    
    console.log('PIXI.jsレンダラーが初期化されました');
  }

  /**
   * ビジュアルエフェクト用のフィルターを設定
   * 
   * 適用するフィルター：
   * 1. BlurFilter: パーティクルにソフトな見た目を与える
   * 2. カスタム閾値フィルター: アルファ値に基づいて色を変更
   */
  private setupFilters(): void {
    // ブラーフィルターの設定
    const blurFilter = new PIXI.filters.BlurFilter();
    blurFilter.blur = FILTER_CONFIG.blur;
    blurFilter.autoFit = true;

    // カスタム閾値フィルター用のシェーダー
    // アルファ値が閾値を超える部分を指定した色で描画
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
    const thresholdFilter = new PIXI.Filter(undefined, fragSource, uniformData);
    
    // ステージにフィルターを適用
    this.stage.filters = [blurFilter, thresholdFilter];
    this.stage.filterArea = this.renderer.screen;
    
    console.log('ビジュアルフィルターが設定されました');
  }

  /**
   * 画面サイズ変更時にレンダラーをリサイズ
   */
  resize(width: number, height: number): void {
    this.renderer.resize(width, height);
  }

  /**
   * フレームごとのレンダリング処理を実行
   */
  render(): void {
    this.renderer.render(this.stage);
  }

  /**
   * メインステージコンテナを取得
   */
  getStage(): PIXI.Container {
    return this.stage;
  }

  /**
   * レンダラーインスタンスを取得
   */
  getRenderer(): PIXI.Renderer {
    return this.renderer;
  }
}