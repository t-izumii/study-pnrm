/**
 * イベントリスナーの型定義
 */
type EventListener = (...args: any[]) => void;

/**
 * イベント管理を担当するクラス
 * 
 * 責任:
 * - DOM イベントリスナーの登録・削除
 * - リサイズイベントのデバウンス処理
 * - イベントリスナーのライフサイクル管理
 */
export class EventManager {
  private eventListeners = new Map<string, EventListener>();
  private resizeDebounceId?: number;
  private readonly debounceDelay: number;

  constructor(debounceDelay = 100) {
    this.debounceDelay = debounceDelay;
  }

  /**
   * リサイズイベントリスナーを設定
   */
  setupResizeListener(callback: () => Promise<void>): void {
    const resizeHandler = () => {
      this.handleResize(callback);
    };

    window.addEventListener("resize", resizeHandler);
    this.eventListeners.set("resize", resizeHandler);
  }

  /**
   * デバウンス付きリサイズ処理
   */
  private handleResize(callback: () => Promise<void>): void {
    if (this.resizeDebounceId) {
      clearTimeout(this.resizeDebounceId);
    }

    this.resizeDebounceId = window.setTimeout(async () => {
      try {
        await callback();
      } catch (error) {
        console.error("リサイズ処理中にエラーが発生:", error);
      }
    }, this.debounceDelay);
  }

  /**
   * 特定のイベントリスナーを削除
   */
  removeEventListener(eventType: string): void {
    const listener = this.eventListeners.get(eventType);
    
    if (!listener) {
      return;
    }

    switch (eventType) {
      case "resize":
        window.removeEventListener("resize", listener);
        break;
      default:
        console.warn(`未知のイベントタイプ: ${eventType}`);
        return;
    }

    this.eventListeners.delete(eventType);
  }

  /**
   * 全てのイベントリスナーを削除
   */
  removeAllEventListeners(): void {
    for (const [eventType] of this.eventListeners) {
      this.removeEventListener(eventType);
    }
  }

  /**
   * デバウンスタイマーをクリア
   */
  clearDebounceTimer(): void {
    if (this.resizeDebounceId) {
      clearTimeout(this.resizeDebounceId);
      this.resizeDebounceId = undefined;
    }
  }

  /**
   * リソースのクリーンアップ
   */
  destroy(): void {
    this.clearDebounceTimer();
    this.removeAllEventListeners();
  }

  /**
   * 現在のイベントリスナー数を取得（デバッグ用）
   */
  getListenerCount(): number {
    return this.eventListeners.size;
  }
}
