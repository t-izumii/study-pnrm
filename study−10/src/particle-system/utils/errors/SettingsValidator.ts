import type { ParticleAppOptions, ValidationResult, ParticleError } from "../../types/particle-types";
import { ValidationError } from "./ParticleSystemError";

/**
 * 設定値のバリデーションを行うクラス
 */
export class SettingsValidator {
  
  /**
   * パーティクルアプリケーションの設定を検証
   */
  static validateOptions(options: ParticleAppOptions): ValidationResult {
    const errors: ParticleError[] = [];
    const warnings: string[] = [];

    // 必須フィールドの検証
    this.validateRequiredFields(options, errors);

    // 数値範囲の検証
    this.validateNumericRanges(options, errors);

    // タイプ固有の検証
    this.validateTypeSpecific(options, errors, warnings);

    // ブレイクポイントの検証
    this.validateBreakpoints(options, errors, warnings);

    // 非推奨オプションの警告
    this.checkDeprecatedOptions(options, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 必須フィールドの検証
   */
  private static validateRequiredFields(options: ParticleAppOptions, errors: ParticleError[]): void {
    if (!options.type) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "typeは必須です",
      });
    }

    if (options.type === "text" && !options.text) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "type='text'の場合、textは必須です",
      });
    }

    if (options.type === "image" && !options.imageSrc) {
      errors.push({
        code: "MISSING_REQUIRED_FIELD",
        message: "type='image'の場合、imageSrcは必須です",
      });
    }
  }

  /**
   * 数値範囲の検証
   */
  private static validateNumericRanges(options: ParticleAppOptions, errors: ParticleError[]): void {
    // friction: 0-1の範囲
    if (options.friction !== undefined) {
      if (options.friction < 0 || options.friction > 1) {
        errors.push({
          code: "INVALID_RANGE",
          message: "frictionは0から1の範囲で指定してください",
          details: { value: options.friction, field: "friction" },
        });
      }
    }

    // threshold: 0-1の範囲
    if (options.threshold !== undefined) {
      if (options.threshold < 0 || options.threshold > 1) {
        errors.push({
          code: "INVALID_RANGE",
          message: "thresholdは0から1の範囲で指定してください",
          details: { value: options.threshold, field: "threshold" },
        });
      }
    }

    // 正の数値の検証
    const positiveFields = ['size', 'scale', 'density', 'mouseRadius', 'moveSpeed'];
    positiveFields.forEach(field => {
      const value = (options as Record<string, unknown>)[field];
      if (value !== undefined && (typeof value !== 'number' || value <= 0)) {
        errors.push({
          code: "INVALID_VALUE",
          message: `${field}は正の数値で指定してください`,
          details: { value, field },
        });
      }
    });
  }

  /**
   * タイプ固有の検証
   */
  private static validateTypeSpecific(
    options: ParticleAppOptions, 
    errors: ParticleError[], 
    warnings: string[]
  ): void {
    if (options.type === "image") {
      // 画像の場合、width/heightの推奨
      if (!options.width || !options.height) {
        warnings.push("画像パーティクルではwidthとheightの指定を推奨します");
      }
    }

    if (options.type === "text") {
      // テキストの場合、フォントの推奨
      if (!options.font) {
        warnings.push("テキストパーティクルではfontの指定を推奨します");
      }
    }
  }

  /**
   * ブレイクポイントの検証
   */
  private static validateBreakpoints(
    options: ParticleAppOptions, 
    errors: ParticleError[], 
    warnings: string[]
  ): void {
    if (!options.breakpoints) {
      return;
    }

    const breakpointKeys = Object.keys(options.breakpoints).map(Number);
    
    // ブレイクポイントが正の整数かチェック
    breakpointKeys.forEach(key => {
      if (key <= 0 || !Number.isInteger(key)) {
        errors.push({
          code: "INVALID_BREAKPOINT",
          message: "ブレイクポイントは正の整数で指定してください",
          details: { breakpoint: key },
        });
      }
    });

    // ブレイクポイント内の設定値を検証
    Object.entries(options.breakpoints).forEach(([key, settings]) => {
      if (settings.friction !== undefined && (settings.friction < 0 || settings.friction > 1)) {
        errors.push({
          code: "INVALID_BREAKPOINT_VALUE",
          message: `ブレイクポイント ${key} のfrictionは0-1の範囲で指定してください`,
          details: { breakpoint: key, field: "friction", value: settings.friction },
        });
      }

      if (settings.threshold !== undefined && (settings.threshold < 0 || settings.threshold > 1)) {
        errors.push({
          code: "INVALID_BREAKPOINT_VALUE",
          message: `ブレイクポイント ${key} のthresholdは0-1の範囲で指定してください`,
          details: { breakpoint: key, field: "threshold", value: settings.threshold },
        });
      }
    });
  }

  /**
   * 非推奨オプションの警告
   */
  private static checkDeprecatedOptions(options: ParticleAppOptions, warnings: string[]): void {
    if (options.tint !== undefined) {
      warnings.push("tintオプションは非推奨です。colorを使用してください");
    }
  }

  /**
   * バリデーション結果から例外を投げる
   */
  static throwIfInvalid(result: ValidationResult): void {
    if (!result.isValid) {
      const errorMessages = result.errors.map(error => error.message).join(", ");
      throw new ValidationError(
        `設定検証に失敗しました: ${errorMessages}`,
        { errors: result.errors, warnings: result.warnings }
      );
    }
  }

  /**
   * 色値（16進数）の検証
   */
  static validateColor(color: number): boolean {
    return Number.isInteger(color) && color >= 0 && color <= 0xFFFFFF;
  }

  /**
   * DOM セレクターの検証
   */
  static validateSelector(selector: string): boolean {
    try {
      document.querySelector(selector);
      return true;
    } catch {
      return false;
    }
  }
}
