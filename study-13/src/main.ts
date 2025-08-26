/**
 * アプリケーションのメインエントリーポイント
 * 
 * アプリケーション全体の初期化と実行制御を行います：
 * - 非同期フォント読み込み
 * - 各マネージャークラスの初期化
 * - アニメーションループの開始
 * - ライフサイクル管理
 */

import { Visual } from './visual';
import { RendererManager } from './managers/renderer-manager';
import { EventManager } from './managers/event-manager';
import { FontLoader } from './utils/font-loader';
import './style.css';

class App {
  // PIXI.jsレンダラーとエフェクト管理
  private rendererManager: RendererManager;
  // ブラウザイベント管理
  private eventManager: EventManager;
  // パーティクルシステム管理
  private visual: Visual;
  
  // 現在の画面サイズ
  private stageWidth: number = 0;
  private stageHeight: number = 0;
  
  // リサイズデバウンス用
  private resizeTimer: NodeJS.Timeout | null = null;
  private isResizing: boolean = false;

  constructor() {
    this.init();
  }

  /**
   * アプリケーションの非同期初期化処理
   * 
   * 初期化の順序：
   * 1. フォント読み込み（Google Fonts）
   * 2. 各マネージャーインスタンスの作成
   * 3. イベントリスナーの設定
   * 4. 初回画面サイズ調整
   * 5. アニメーションループ開始
   */
  private async init(): Promise<void> {
    try {
      console.log('アプリケーション初期化開始...');
      
      // Google Fontsからフォントを非同期読み込み
      await FontLoader.loadFont();
      
      // 各管理クラスのインスタンスを作成
      this.rendererManager = new RendererManager();
      this.eventManager = new EventManager();
      this.visual = new Visual();

      // イベントハンドラーを設定
      this.setupEventListeners();
      
      // 初回のサイズ調整とパーティクル配置
      this.resize();
      
      // メインアニメーションループを開始
      this.startAnimationLoop();
      
      console.log('アプリケーション初期化完了！');
    } catch (error) {
      console.error('アプリケーション初期化中にエラーが発生しました:', error);
    }
  }

  /**
   * イベントマネージャーにリサイズコールバックを登録
   * ウィンドウサイズ変更時に自動でレイアウトを調整
   */
  private setupEventListeners(): void {
    this.eventManager.addResizeListener(this.debouncedResize.bind(this));
  }

  /**
   * デバウンス機能付きリサイズ処理
   * 連続したリサイズイベントを適切に間引きして処理
   */
  private debouncedResize(): void {
    // 現在リサイズ中の場合はタイマーをリセット
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    
    this.isResizing = true;
    
    // 150ms待ってから実際のリサイズ処理を実行
    this.resizeTimer = setTimeout(() => {
      this.resize();
      this.isResizing = false;
      this.resizeTimer = null;
    }, 150);
  }

  /**
   * 画面リサイズ処理
   * 
   * リサイズ時の処理順序：
   * 1. 新しい画面サイズを取得
   * 2. PIXI.jsレンダラーをリサイズ
   * 3. パーティクルシステムを新サイズで再構築
   */
  private resize(): void {
    // ブラウザウィンドウのサイズを取得
    const newWidth = document.body.clientWidth;
    const newHeight = document.body.clientHeight;

    // サイズが変更されていない場合は処理をスキップ
    if (this.stageWidth === newWidth && this.stageHeight === newHeight) {
      console.log('サイズ変更なし: スキップ');
      return;
    }

    this.stageWidth = newWidth;
    this.stageHeight = newHeight;

    console.log(`画面サイズ変更: ${this.stageWidth}x${this.stageHeight}`);

    // レンダラーを新しいサイズにリサイズ
    this.rendererManager.resize(this.stageWidth, this.stageHeight);
    
    // パーティクルシステムを新しいサイズで再構築
    this.visual.show(this.stageWidth, this.stageHeight, this.rendererManager.getStage());
  }

  /**
   * メインアニメーションループを開始
   * 
   * 60FPS目標でのゲームループ：
   * 1. requestAnimationFrameで次フレームを予約
   * 2. パーティクル物理シミュレーション更新
   * 3. PIXI.jsによる画面描画
   * 4. 再帰的にループ継続
   */
  private startAnimationLoop(): void {
    const animate = (): void => {
      // ブラウザの最適なタイミングで次フレームを予約
      requestAnimationFrame(animate);
      
      // パーティクルシステムのアニメーション更新
      this.visual.animate();
      
      // 画面に描画を実行
      this.rendererManager.render();
    };
    
    console.log('アニメーションループを開始します');
    animate();
  }

  /**
   * アプリケーション終了時のクリーンアップ処理
   * メモリリークを防ぐため、明示的にリソースを解放
   */
  destroy(): void {
    console.log('アプリケーションを終了しています...');
    
    this.eventManager.destroy();
    this.visual.destroy();
    
    console.log('アプリケーション終了完了');
  }
}

/**
 * DOMContentLoadedの代わりにwindow.onloadを使用
 * 全てのリソース（画像、フォントなど）の読み込み完了を待つ
 */
window.onload = () => {
  console.log('ページ読み込み完了、アプリケーションを開始します');
  new App();
};
