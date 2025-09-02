import type { ParticleApp } from '../core/ParticleApp';

/**
 * パーティクルプラグインのインターフェース
 */
export interface ParticlePlugin {
  /** プラグインの一意な名前 */
  readonly name: string;
  /** プラグインのバージョン */
  readonly version: string;
  /** プラグインの説明 */
  readonly description?: string;

  /**
   * プラグインの初期化
   * @param app パーティクルアプリケーションのインスタンス
   */
  initialize(app: ParticleApp): void | Promise<void>;

  /**
   * プラグインの終了処理（オプション）
   */
  dispose?(): void | Promise<void>;

  /**
   * アニメーションフレーム毎の処理（オプション）
   */
  onFrame?(): void;

  /**
   * リサイズ時の処理（オプション）
   */
  onResize?(width: number, height: number): void;
}

/**
 * プラグイン管理システム
 */
export class PluginManager {
  private static plugins = new Map<string, ParticlePlugin>();
  private static appPlugins = new WeakMap<ParticleApp, Set<ParticlePlugin>>();

  /**
   * プラグインを登録
   */
  static register(plugin: ParticlePlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`プラグイン "${plugin.name}" は既に登録されています`);
      return;
    }

    this.plugins.set(plugin.name, plugin);
    console.log(`プラグイン "${plugin.name}" v${plugin.version} が登録されました`);
  }

  /**
   * プラグインの登録を解除
   */
  static unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      console.warn(`プラグイン "${pluginName}" が見つかりません`);
      return;
    }

    // 使用中のアプリからプラグインを削除
    this.appPlugins.forEach((pluginSet, app) => {
      if (pluginSet.has(plugin)) {
        this.detachFromApp(app, pluginName);
      }
    });

    this.plugins.delete(pluginName);
    console.log(`プラグイン "${pluginName}" の登録が解除されました`);
  }

  /**
   * アプリケーションにプラグインをアタッチ
   */
  static async attachToApp(app: ParticleApp, pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`プラグイン "${pluginName}" が見つかりません`);
    }

    // アプリケーション用のプラグインセットを初期化
    if (!this.appPlugins.has(app)) {
      this.appPlugins.set(app, new Set());
    }

    const appPluginSet = this.appPlugins.get(app)!;
    
    if (appPluginSet.has(plugin)) {
      console.warn(`プラグイン "${pluginName}" は既にアタッチされています`);
      return;
    }

    try {
      await plugin.initialize(app);
      appPluginSet.add(plugin);
      console.log(`プラグイン "${pluginName}" をアプリケーションにアタッチしました`);
    } catch (error) {
      console.error(`プラグイン "${pluginName}" の初期化に失敗しました:`, error);
      throw error;
    }
  }

  /**
   * アプリケーションからプラグインをデタッチ
   */
  static async detachFromApp(app: ParticleApp, pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    const appPluginSet = this.appPlugins.get(app);
    
    if (!plugin || !appPluginSet || !appPluginSet.has(plugin)) {
      console.warn(`プラグイン "${pluginName}" はアタッチされていません`);
      return;
    }

    try {
      if (plugin.dispose) {
        await plugin.dispose();
      }
      appPluginSet.delete(plugin);
      console.log(`プラグイン "${pluginName}" をアプリケーションからデタッチしました`);
    } catch (error) {
      console.error(`プラグイン "${pluginName}" の終了処理に失敗しました:`, error);
    }
  }

  /**
   * アプリケーションにアタッチされたプラグインでフレーム処理を実行
   */
  static executeFrameHooks(app: ParticleApp): void {
    const appPluginSet = this.appPlugins.get(app);
    if (!appPluginSet) return;

    appPluginSet.forEach(plugin => {
      if (plugin.onFrame) {
        try {
          plugin.onFrame();
        } catch (error) {
          console.error(`プラグイン "${plugin.name}" のフレーム処理でエラー:`, error);
        }
      }
    });
  }

  /**
   * アプリケーションにアタッチされたプラグインでリサイズ処理を実行
   */
  static executeResizeHooks(app: ParticleApp, width: number, height: number): void {
    const appPluginSet = this.appPlugins.get(app);
    if (!appPluginSet) return;

    appPluginSet.forEach(plugin => {
      if (plugin.onResize) {
        try {
          plugin.onResize(width, height);
        } catch (error) {
          console.error(`プラグイン "${plugin.name}" のリサイズ処理でエラー:`, error);
        }
      }
    });
  }

  /**
   * 登録済みプラグイン一覧を取得
   */
  static getRegisteredPlugins(): Array<{ name: string; version: string; description?: string }> {
    return Array.from(this.plugins.values()).map(plugin => ({
      name: plugin.name,
      version: plugin.version,
      description: plugin.description
    }));
  }

  /**
   * アプリケーションにアタッチされているプラグイン一覧を取得
   */
  static getAttachedPlugins(app: ParticleApp): string[] {
    const appPluginSet = this.appPlugins.get(app);
    if (!appPluginSet) return [];

    return Array.from(appPluginSet).map(plugin => plugin.name);
  }

  /**
   * 全アプリケーションのプラグインを一括解除（テスト用）
   */
  static dispose(): void {
    this.plugins.clear();
    this.appPlugins = new WeakMap();
  }
}