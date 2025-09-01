import type { ParticleError } from "../../types/particle-types";

/**
 * パーティクルシステム用のカスタムエラークラス
 */
export class ParticleSystemError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ParticleSystemError";
    this.code = code;
    this.details = details;

    // Error クラスの継承に関するTypeScriptの問題を解決
    Object.setPrototypeOf(this, ParticleSystemError.prototype);
  }

  /**
   * エラー情報をオブジェクトとして取得
   */
  toErrorInfo(): ParticleError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }

  /**
   * エラー情報をJSON形式で取得
   */
  toJSON(): string {
    return JSON.stringify(this.toErrorInfo());
  }
}

/**
 * 初期化エラー
 */
export class InitializationError extends ParticleSystemError {
  constructor(message: string, details?: unknown) {
    super("INITIALIZATION_ERROR", message, details);
    this.name = "InitializationError";
  }
}

/**
 * 設定エラー
 */
export class ConfigurationError extends ParticleSystemError {
  constructor(message: string, details?: unknown) {
    super("CONFIGURATION_ERROR", message, details);
    this.name = "ConfigurationError";
  }
}

/**
 * レンダリングエラー
 */
export class RenderingError extends ParticleSystemError {
  constructor(message: string, details?: unknown) {
    super("RENDERING_ERROR", message, details);
    this.name = "RenderingError";
  }
}

/**
 * リソースエラー（フォント読み込み、画像読み込みなど）
 */
export class ResourceError extends ParticleSystemError {
  constructor(message: string, details?: unknown) {
    super("RESOURCE_ERROR", message, details);
    this.name = "ResourceError";
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends ParticleSystemError {
  constructor(message: string, details?: unknown) {
    super("VALIDATION_ERROR", message, details);
    this.name = "ValidationError";
  }
}
