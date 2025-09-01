import type { ResolvedSettings } from "./SettingsManager";
import type { ParticleSystem } from "../ParticleSystem";
import type { FilterManager } from "../FilterManager";

/**
 * 設定値をシステムに適用する処理を担当するクラス
 * 
 * 責任:
 * - 設定値の変更をParticleSystemとFilterManagerに伝達
 * - 設定適用の順序制御
 * - 適用エラーのハンドリング
 */
export class SettingsApplicator {
  private particleSystem?: ParticleSystem;
  private filterManager?: FilterManager;

  setParticleSystem(particleSystem: ParticleSystem): void {
    this.particleSystem = particleSystem;
  }

  setFilterManager(filterManager: FilterManager): void {
    this.filterManager = filterManager;
  }

  /**
   * 設定値をシステムに適用
   */
  applySettings(settings: ResolvedSettings): void {
    this.applyFilterSettings(settings);
    this.applyParticleSettings(settings);
  }

  /**
   * フィルター関連の設定を適用
   */
  private applyFilterSettings(settings: ResolvedSettings): void {
    if (!this.filterManager) {
      console.warn("FilterManagerが設定されていません");
      return;
    }

    try {
      // ブラー強度を設定
      if (settings.blur !== undefined) {
        this.filterManager.setBlurStrength(settings.blur);
      }

      // 閾値を設定
      this.filterManager.setThreshold(settings.threshold);

      // 色を設定
      this.filterManager.setColor(settings.color);
    } catch (error) {
      console.error("フィルター設定の適用に失敗:", error);
    }
  }

  /**
   * パーティクル関連の設定を適用
   */
  private applyParticleSettings(settings: ResolvedSettings): void {
    if (!this.particleSystem) {
      console.warn("ParticleSystemが設定されていません");
      return;
    }

    try {
      // マウス影響範囲を設定
      this.particleSystem.setMouseRadius(settings.mouseRadius);

      // 物理パラメータを設定
      this.particleSystem.setPhysicsParams(settings.friction, settings.moveSpeed);
    } catch (error) {
      console.error("パーティクル設定の適用に失敗:", error);
    }
  }

  /**
   * 個別の設定値を適用（実行時の動的変更用）
   */
  applySingleSetting(key: keyof ResolvedSettings, value: any): void {
    try {
      switch (key) {
        case 'blur':
          this.filterManager?.setBlurStrength(value);
          break;
        case 'threshold':
          this.filterManager?.setThreshold(value);
          break;
        case 'color':
          this.filterManager?.setColor(value);
          break;
        case 'mouseRadius':
          this.particleSystem?.setMouseRadius(value);
          break;
        case 'friction':
        case 'moveSpeed':
          // 物理パラメータは同時に設定する必要がある場合がある
          console.warn(`${key}の個別設定は推奨されません。applySettingsを使用してください`);
          break;
        default:
          console.warn(`未知の設定キー: ${key}`);
      }
    } catch (error) {
      console.error(`設定 ${key} の適用に失敗:`, error);
    }
  }

  /**
   * 設定可能なキーの一覧を取得
   */
  getAvailableSettings(): Array<keyof ResolvedSettings> {
    return ['blur', 'threshold', 'color', 'mouseRadius', 'friction', 'moveSpeed'];
  }
}
