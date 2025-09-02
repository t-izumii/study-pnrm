import type { ParticleApp } from '../core/ParticleApp';
import { PluginManager, type ParticlePlugin } from '../plugins/plugin-system';

/**
 * 開発支援ツール
 */
export class DevTools {
  private static isEnabled = false;

  /**
   * 開発ツールを有効化
   */
  static enable(): void {
    if (this.isEnabled) {
      console.warn('DevTools: 既に有効化されています');
      return;
    }

    this.isEnabled = true;
    console.log('🛠️ ParticleSystem DevTools が有効化されました');
    
    // グローバルオブジェクトに開発ツールを公開
    (globalThis as any).ParticleDevTools = this;
  }

  /**
   * 開発ツールを無効化
   */
  static disable(): void {
    this.isEnabled = false;
    delete (globalThis as any).ParticleDevTools;
    console.log('DevTools: 無効化されました');
  }

  /**
   * パフォーマンス監視を開始
   */
  static enablePerformanceMonitoring(app: ParticleApp): void {
    this.ensureEnabled();
    PluginManager.attachToApp(app, 'performance-monitor')
      .then(() => console.log('📊 パフォーマンス監視を開始しました'))
      .catch(console.error);
  }

  /**
   * 物理演算の可視化
   */
  static visualizePhysics(app: ParticleApp): void {
    this.ensureEnabled();
    
    const plugin: ParticlePlugin = {
      name: 'physics-visualizer',
      version: '1.0.0',
      description: '物理演算の可視化',
      
      initialize(particleApp: ParticleApp) {
        console.log('🎯 物理演算可視化を開始');
        // ここで物理演算の軌跡や力の方向を描画する実装を追加
      }
    };

    PluginManager.register(plugin);
    PluginManager.attachToApp(app, 'physics-visualizer');
  }

  /**
   * パーティクルの境界を表示
   */
  static showParticleBounds(app: ParticleApp): void {
    this.ensureEnabled();
    
    const plugin: ParticlePlugin = {
      name: 'particle-bounds-visualizer',
      version: '1.0.0',
      description: 'パーティクル境界の可視化',
      
      initialize(particleApp: ParticleApp) {
        console.log('📦 パーティクル境界表示を開始');
        // ここでパーティクルの境界ボックスを描画する実装を追加
      }
    };

    PluginManager.register(plugin);
    PluginManager.attachToApp(app, 'particle-bounds-visualizer');
  }

  /**
   * デバッグ情報パネルを表示
   */
  static showDebugPanel(app: ParticleApp): void {
    this.ensureEnabled();
    PluginManager.attachToApp(app, 'stats-display')
      .then(() => console.log('📋 デバッグパネルを表示しました'))
      .catch(console.error);
  }

  /**
   * キーボードコントロールを有効化
   */
  static enableKeyboardControls(app: ParticleApp): void {
    this.ensureEnabled();
    PluginManager.attachToApp(app, 'keyboard-control')
      .then(() => console.log('⌨️ キーボードコントロールを有効化しました'))
      .catch(console.error);
  }

  /**
   * パーティクルアプリケーションの詳細情報をログ出力
   */
  static inspectApp(app: ParticleApp): void {
    this.ensureEnabled();
    
    const debugInfo = app.getDebugInfo();
    console.group('🔍 ParticleApp 詳細情報');
    console.log('初期化状態:', debugInfo.isInitialized);
    console.log('セレクター:', debugInfo.containerSelector);
    console.log('設定オプション:', debugInfo.options);
    console.log('現在の設定:', debugInfo.currentSettings);
    console.log('画面サイズ:', debugInfo.appSize);
    console.log('イベントリスナー数:', debugInfo.eventListenerCount);
    console.log('アタッチ済みプラグイン:', PluginManager.getAttachedPlugins(app));
    console.groupEnd();
  }

  /**
   * 全プラグインの情報を表示
   */
  static listPlugins(): void {
    this.ensureEnabled();
    
    const plugins = PluginManager.getRegisteredPlugins();
    console.group('🔌 登録済みプラグイン一覧');
    plugins.forEach(plugin => {
      console.log(`• ${plugin.name} v${plugin.version}`);
      if (plugin.description) {
        console.log(`  ${plugin.description}`);
      }
    });
    console.groupEnd();
  }

  /**
   * パフォーマンステストを実行
   */
  static runPerformanceTest(app: ParticleApp, duration = 5000): Promise<{ avgFPS: number; minFPS: number; maxFPS: number }> {
    this.ensureEnabled();
    
    return new Promise((resolve) => {
      let frameCount = 0;
      let fpsHistory: number[] = [];
      let lastTime = performance.now();
      
      console.log(`⏱️ ${duration}ms のパフォーマンステストを開始...`);
      
      const testInterval = setInterval(() => {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
          const fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
          fpsHistory.push(fps);
          frameCount = 0;
          lastTime = currentTime;
        }
      }, 16);

      setTimeout(() => {
        clearInterval(testInterval);
        
        const avgFPS = Math.round(fpsHistory.reduce((sum, fps) => sum + fps, 0) / fpsHistory.length);
        const minFPS = Math.min(...fpsHistory);
        const maxFPS = Math.max(...fpsHistory);
        
        const result = { avgFPS, minFPS, maxFPS };
        
        console.log('📈 パフォーマンステスト結果:');
        console.log(`平均FPS: ${avgFPS}`);
        console.log(`最低FPS: ${minFPS}`);
        console.log(`最高FPS: ${maxFPS}`);
        
        resolve(result);
      }, duration);
    });
  }

  /**
   * メモリ使用量を監視
   */
  static monitorMemory(): void {
    this.ensureEnabled();
    
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      console.log('💾 メモリ使用状況:');
      console.log(`使用中: ${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`制限: ${(memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.warn('このブラウザではメモリ情報を取得できません');
    }
  }

  /**
   * 開発ツールが有効かチェック
   */
  private static ensureEnabled(): void {
    if (!this.isEnabled) {
      throw new Error('DevTools: 使用前に DevTools.enable() を呼び出してください');
    }
  }

  /**
   * ヘルプメッセージを表示
   */
  static help(): void {
    console.log(`
🛠️ ParticleSystem DevTools ヘルプ

基本操作:
• DevTools.enable()                     - 開発ツールを有効化
• DevTools.inspectApp(app)              - アプリケーション情報を表示
• DevTools.listPlugins()                - 登録済みプラグイン一覧

監視・可視化:
• DevTools.enablePerformanceMonitoring(app) - パフォーマンス監視開始
• DevTools.visualizePhysics(app)            - 物理演算可視化
• DevTools.showParticleBounds(app)          - パーティクル境界表示
• DevTools.showDebugPanel(app)              - デバッグパネル表示

コントロール:
• DevTools.enableKeyboardControls(app)      - キーボード操作有効化

テスト:
• DevTools.runPerformanceTest(app, ms)      - パフォーマンステスト実行
• DevTools.monitorMemory()                  - メモリ使用量確認

その他:
• DevTools.help()                           - このヘルプを表示
• DevTools.disable()                        - 開発ツール無効化
    `);
  }
}