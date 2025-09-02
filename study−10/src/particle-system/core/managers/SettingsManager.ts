import type {
  ParticleAppOptions,
  BreakpointSettings,
} from "../../types/particle-types";
import {
  PARTICLE_GENERATION_CONFIG,
  PARTICLE_CONFIG,
  MOUSE_CONFIG,
  FILTER_CONFIG,
} from "../../config/particle-config";
import { SettingsValidator, ValidationError } from "../../utils/errors";

/**
 * 設定値の統合結果
 */
export interface ResolvedSettings {
  density: number;
  scale: number;
  blur?: number;
  size: number;
  width?: number;
  mouseRadius: number;
  friction: number;
  moveSpeed: number;
  color: number;
  threshold: number;
}

/**
 * パーティクルシステムの設定管理を担当するクラス
 *
 * 責任:
 * - ベース設定とブレイクポイント設定のマージ
 * - 画面サイズに応じた適切な設定値の決定
 * - 設定値の正規化と検証
 */
export class SettingsManager {
  private readonly options: ParticleAppOptions;

  constructor(options: ParticleAppOptions) {
    // 設定値を検証
    const validationResult = SettingsValidator.validateOptions(options);

    // 警告を表示
    if (validationResult.warnings.length > 0) {
      validationResult.warnings.forEach((warning) => {
        console.warn(`SettingsManager: ${warning}`);
      });
    }

    // エラーがある場合は例外を投げる
    if (!validationResult.isValid) {
      SettingsValidator.throwIfInvalid(validationResult);
    }

    this.options = options;
  }

  /**
   * 現在の画面幅に基づいて最終的な設定値を取得
   */
  getCurrentSettings(currentWidth: number): ResolvedSettings {
    const baseSettings = this.getBaseSettings();

    if (!this.options.breakpoints) {
      return baseSettings;
    }

    const activeBreakpoint = this.findActiveBreakpoint(currentWidth);

    if (activeBreakpoint === null) {
      return baseSettings;
    }

    const breakpointSettings = this.options.breakpoints[activeBreakpoint];
    return this.mergeSettings(baseSettings, breakpointSettings);
  }

  /**
   * ベース設定値を生成
   */
  private getBaseSettings(): ResolvedSettings {
    return {
      density: this.options.density ?? PARTICLE_GENERATION_CONFIG.density,
      scale: this.options.scale ?? PARTICLE_CONFIG.scale * 10,
      blur: this.options.blur,
      size: this.options.size ?? 100,
      width: this.options.width,
      mouseRadius: this.options.mouseRadius ?? MOUSE_CONFIG.radius,
      friction: this.options.friction ?? PARTICLE_CONFIG.friction,
      moveSpeed: this.options.moveSpeed ?? PARTICLE_CONFIG.moveSpeed,
      // colorを優先し、なければtint、最後にデフォルト
      color: this.options.color ?? this.options.tint ?? PARTICLE_CONFIG.tint,
      threshold: this.options.threshold ?? FILTER_CONFIG.threshold,
    };
  }

  /**
   * アクティブなブレイクポイントを検索
   */
  private findActiveBreakpoint(currentWidth: number): number | null {
    if (!this.options.breakpoints) {
      return null;
    }

    // ブレイクポイントを幅の昇順でソート
    const sortedBreakpoints = Object.keys(this.options.breakpoints)
      .map(Number)
      .sort((a, b) => a - b);

    // 現在の幅に適用されるブレイクポイントを検索
    let activeBreakpoint: number | null = null;
    for (const breakpoint of sortedBreakpoints) {
      if (currentWidth >= breakpoint) {
        activeBreakpoint = breakpoint;
      } else {
        break;
      }
    }

    return activeBreakpoint;
  }

  /**
   * ベース設定とブレイクポイント設定をマージ
   */
  private mergeSettings(
    base: ResolvedSettings,
    breakpoint: BreakpointSettings
  ): ResolvedSettings {
    return {
      density: breakpoint.density ?? base.density,
      scale: breakpoint.scale ?? base.scale,
      blur: breakpoint.blur ?? base.blur,
      size: breakpoint.size ?? base.size,
      width: breakpoint.width ?? base.width,
      mouseRadius: breakpoint.mouseRadius ?? base.mouseRadius,
      friction: breakpoint.friction ?? base.friction,
      moveSpeed: breakpoint.moveSpeed ?? base.moveSpeed,
      // ブレイクポイントでもcolorを優先
      color: breakpoint.color ?? breakpoint.tint ?? base.color,
      threshold: breakpoint.threshold ?? base.threshold,
    };
  }

  /**
   * 設定値の妥当性を検証
   */
  validateSettings(settings: ResolvedSettings): boolean {
    return (
      settings.friction >= 0 &&
      settings.friction <= 1 &&
      settings.threshold >= 0 &&
      settings.threshold <= 1 &&
      settings.density > 0 &&
      settings.scale > 0 &&
      settings.size > 0 &&
      settings.mouseRadius > 0
    );
  }

  /**
   * デバッグ情報を出力
   */
  debugSettings(settings: ResolvedSettings, currentWidth: number): void {
    if (process.env.NODE_ENV === "development") {
      console.log(`SettingsManager: 画面幅 ${currentWidth}px`);
      console.log("適用設定:", settings);

      const activeBreakpoint = this.findActiveBreakpoint(currentWidth);
      if (activeBreakpoint !== null) {
        console.log(`アクティブブレイクポイント: ${activeBreakpoint}px`);
      }
    }
  }
}
