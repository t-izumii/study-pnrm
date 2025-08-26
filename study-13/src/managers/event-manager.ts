/**
 * ブラウザイベントの管理を行うクラス
 * 
 * 主な責任：
 * - ウィンドウリサイズイベントの管理
 * - 複数のリスナー関数の登録・削除
 * - メモリリーク防止のためのクリーンアップ
 */

export class EventManager {
  // リサイズイベント時に実行するコールバック関数のリスト
  private resizeCallbacks: (() => void)[] = [];

  constructor() {
    this.setupEventListeners();
  }

  /**
   * ブラウザイベントリスナーを設定
   * window.onresizeではなくaddEventListenerを使用して複数のリスナーに対応
   */
  private setupEventListeners(): void {
    window.addEventListener('resize', this.handleResize.bind(this), false);
    console.log('イベントリスナーが設定されました');
  }

  /**
   * ウィンドウリサイズ時の処理
   * 登録されている全てのコールバック関数を順次実行
   */
  private handleResize(): void {
    this.resizeCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('リサイズコールバック実行中にエラーが発生しました:', error);
      }
    });
  }

  /**
   * リサイズイベント時に実行するコールバック関数を追加
   * @param callback - リサイズ時に実行する関数
   */
  addResizeListener(callback: () => void): void {
    this.resizeCallbacks.push(callback);
    console.log('リサイズリスナーが追加されました');
  }

  /**
   * 登録済みのリサイズコールバック関数を削除
   * @param callback - 削除する関数
   */
  removeResizeListener(callback: () => void): void {
    const index = this.resizeCallbacks.indexOf(callback);
    if (index > -1) {
      this.resizeCallbacks.splice(index, 1);
      console.log('リサイズリスナーが削除されました');
    }
  }

  /**
   * 全てのイベントリスナーを削除してメモリリークを防止
   * アプリケーション終了時に呼び出す
   */
  destroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this), false);
    this.resizeCallbacks = [];
    console.log('EventManagerが破棄されました');
  }
}