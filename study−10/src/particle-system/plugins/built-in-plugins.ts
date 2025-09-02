import type { ParticlePlugin } from './plugin-system';
import type { ParticleApp } from '../core/ParticleApp';

/**
 * パフォーマンス監視プラグイン
 */
export class PerformanceMonitorPlugin implements ParticlePlugin {
  readonly name = 'performance-monitor';
  readonly version = '1.0.0';
  readonly description = 'パフォーマンス指標を監視・表示します';

  private app?: ParticleApp;
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;

  initialize(app: ParticleApp): void {
    this.app = app;
    console.log('パフォーマンス監視を開始しました');
  }

  onFrame(): void {
    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      // デバッグ情報をコンソールに出力
      if (this.fps < 30) {
        console.warn(`低FPS検出: ${this.fps}fps`);
      }
    }
  }

  getFPS(): number {
    return this.fps;
  }

  dispose(): void {
    console.log('パフォーマンス監視を終了しました');
  }
}

/**
 * キーボードコントロールプラグイン
 */
export class KeyboardControlPlugin implements ParticlePlugin {
  readonly name = 'keyboard-control';
  readonly version = '1.0.0';
  readonly description = 'キーボードでパーティクル設定を動的に変更します';

  private app?: ParticleApp;
  private keyHandler?: (e: KeyboardEvent) => void;

  initialize(app: ParticleApp): void {
    this.app = app;
    
    this.keyHandler = (e: KeyboardEvent) => {
      switch (e.key) {
        case '1':
          app.setColor(0xff0000); // 赤
          console.log('パーティクル色: 赤');
          break;
        case '2':
          app.setColor(0x00ff00); // 緑
          console.log('パーティクル色: 緑');
          break;
        case '3':
          app.setColor(0x0000ff); // 青
          console.log('パーティクル色: 青');
          break;
        case '+':
          app.setMouseRadius(50);
          console.log('マウス影響範囲: 拡大');
          break;
        case '-':
          app.setMouseRadius(10);
          console.log('マウス影響範囲: 縮小');
          break;
        case 'r':
          app.resetFilters();
          console.log('フィルターリセット');
          break;
      }
    };

    document.addEventListener('keydown', this.keyHandler);
    console.log('キーボードコントロールを有効化しました');
    console.log('操作: 1,2,3=色変更, +/-=マウス範囲, r=リセット');
  }

  dispose(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
    }
    console.log('キーボードコントロールを無効化しました');
  }
}

/**
 * 統計情報表示プラグイン
 */
export class StatsDisplayPlugin implements ParticlePlugin {
  readonly name = 'stats-display';
  readonly version = '1.0.0';
  readonly description = 'パーティクルシステムの統計情報をDOM要素に表示します';

  private app?: ParticleApp;
  private statsElement?: HTMLElement;
  private updateInterval?: number;

  initialize(app: ParticleApp): void {
    this.app = app;
    this.createStatsElement();
    
    this.updateInterval = window.setInterval(() => {
      this.updateStats();
    }, 1000);

    console.log('統計情報表示を開始しました');
  }

  private createStatsElement(): void {
    this.statsElement = document.createElement('div');
    this.statsElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      border-radius: 4px;
      z-index: 9999;
    `;
    document.body.appendChild(this.statsElement);
  }

  private updateStats(): void {
    if (!this.statsElement || !this.app) return;

    const debugInfo = this.app.getDebugInfo();
    
    this.statsElement.innerHTML = `
      <div>初期化済み: ${debugInfo.isInitialized ? 'Yes' : 'No'}</div>
      <div>画面サイズ: ${debugInfo.appSize?.width || 0} x ${debugInfo.appSize?.height || 0}</div>
      <div>イベントリスナー: ${debugInfo.eventListenerCount}</div>
      <div>設定: ${debugInfo.currentSettings ? 'OK' : 'None'}</div>
    `;
  }

  dispose(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    if (this.statsElement && this.statsElement.parentNode) {
      this.statsElement.parentNode.removeChild(this.statsElement);
    }
    
    console.log('統計情報表示を終了しました');
  }
}

/**
 * 組み込みプラグインの登録関数
 */
export function registerBuiltInPlugins(): void {
  const { PluginManager } = require('./plugin-system');
  
  PluginManager.register(new PerformanceMonitorPlugin());
  PluginManager.register(new KeyboardControlPlugin());
  PluginManager.register(new StatsDisplayPlugin());
}