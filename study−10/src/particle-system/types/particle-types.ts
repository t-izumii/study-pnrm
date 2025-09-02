/**
 * パーティクルシステムで使用する型定義（リファクタリング版）
 */

// ブレイクポイント用の設定型
export interface BreakpointSettings {
  density?: number;
  scale?: number;
  blur?: number;
  size?: number; // フォントサイズ
  width?: number; // 画像幅
  mouseRadius?: number; // マウス影響範囲
  friction?: number; // 摩擦係数
  moveSpeed?: number; // 復元力
  tint?: number; // パーティクルの色（非推奨）
  color?: number; // パーティクルの色 (hex)
  threshold?: number; // 閾値フィルター
}

/**
 * Google Font設定
 */
export interface GoogleFontConfig {
  familyName: string; // Google Fontのファミリー名（例: "Noto Sans JP"）
  weights?: string[]; // ウェイトの配列（例: ['400', '700']）
  subsets?: string[]; // 文字セット（例: ['latin', 'japanese']）
}

/**
 * フォント設定の型
 */
export type FontConfig = string | {
  // 通常のフォント指定（既存互換性）
  family?: string;
  // Google Font指定
  googleFont?: GoogleFontConfig;
};

/**
 * 共通のパーティクル設定
 */
interface BaseParticleOptions {
  density?: number; // パーティクル密度（値が小さいほど密度が高い）
  scale?: number; // パーティクルサイズ倍率
  blur?: number; // ブラー効果の強度
  mouseRadius?: number; // マウス影響範囲半径
  friction?: number; // 摩擦係数 (0-1)
  moveSpeed?: number; // 元の位置に戻る力の強さ
  tint?: number; // パーティクルの色 (hex) - 非推奨
  color?: number; // パーティクルの色 (hex) - 推奨
  threshold?: number; // 閾値フィルターの閾値 (0-1)
  // ブレイクポイント設定
  breakpoints?: Record<number, BreakpointSettings>;
}

/**
 * テキストパーティクルの設定オプション
 */
export interface TextParticleOptions extends BaseParticleOptions {
  type: "text";
  text: string; // 必須
  font?: FontConfig;
  weight?: number | string; // フォントウェイト
  size?: number; // フォントサイズ
}

/**
 * 画像パーティクルの設定オプション
 */
export interface ImageParticleOptions extends BaseParticleOptions {
  type: "image";
  imageSrc: string; // 必須
  width?: number;
  height?: number;
}

/**
 * パーティクルアプリケーションの設定オプション（判別可能な共用体型）
 */
export type ParticleAppOptions = TextParticleOptions | ImageParticleOptions;

/**
 * パーティクルの種類（後方互換性のため残す）
 * @deprecated 型安全性のためParticleAppOptionsの判別プロパティを使用してください
 */
export type ParticleType = "text" | "image";

/**
 * 2D座標を表現するインターフェース
 * パーティクルの位置、マウスの位置などで使用
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * マウス/ポインターの状態を表現するインターフェース
 */
export interface MouseState {
  x: number;
  y: number;
  radius: number; // マウスの影響範囲
}

/**
 * パーティクルの物理的な動作設定の型
 */
export interface ParticleConfig {
  readonly friction: number; // 摩擦係数（0-1）
  readonly moveSpeed: number; // 復元力の強さ
  readonly scale: number; // 表示サイズ倍率
  readonly tint: number; // 色（16進数）
}

/**
 * パーティクル生成に関する設定型
 */
export interface ParticleGenerationConfig {
  readonly density: number; // パーティクル密度
}

/**
 * パーティクルの初期化オプション
 */
export interface ParticleOptions {
  position: Position;
  texture?: unknown; // PIXI.Textureの型（PIXIの型をここで直接importしないため）
}

/**
 * 物理演算で使用する力ベクトル
 */
export interface Force {
  x: number;
  y: number;
}

/**
 * パーティクルの状態を表現する型
 */
export interface ParticleState {
  position: Position;
  velocity: Force;
  originalPosition: Position;
}

/**
 * パーティクルマネージャーが管理するイベントの型
 */
export type ParticleEventType =
  | "particleCreated"
  | "particleDestroyed"
  | "systemCleaned"
  | "mouseInteraction";

/**
 * パーティクルイベントリスナーの型
 */
export type ParticleEventListener = (...args: unknown[]) => void;

/**
 * デバッグ情報の型
 */
export interface DebugInfo {
  isInitialized: boolean;
  containerSelector: string;
  options: ParticleAppOptions;
  currentSettings: unknown;
  eventListenerCount: number;
  appSize: {
    width: number;
    height: number;
  } | null;
}

/**
 * エラー情報の型
 */
export interface ParticleError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * 設定検証結果の型
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ParticleError[];
  warnings: string[];
}

/**
 * パフォーマンス情報の型
 */
export interface PerformanceInfo {
  particleCount: number;
  fps: number;
  memoryUsage?: number;
  renderTime?: number;
}
