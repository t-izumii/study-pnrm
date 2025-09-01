/**
 * パーティクルシステムで使用する型定義
 */

// ブレイクポイント用の設定型
export interface BreakpointSettings {
  density?: number;
  scale?: number;
  blur?: number;
  size?: number; // フォントサイズ
  mouseRadius?: number; // マウス影響範囲
  friction?: number; // 摩擦係数
  moveSpeed?: number; // 復元力
  tint?: number; // パーティクルの色（非推奨）
  color?: number; // パーティクルの色 (hex)
  threshold?: number; // 闾値フィルター
}

export interface ParticleAppOptions {
  type: "text" | "image";
  text?: string; // type="text"の場合
  font?: string | {
    // 通常のフォント指定（既存互換性）
    family?: string;
    // Google Font指定
    googleFont?: {
      familyName: string; // Google Fontのファミリー名（例: "Noto Sans JP"）
      weights?: string[]; // ウェイトの配列（例: ['400', '700']）
      subsets?: string[]; // 文字セット（例: ['latin', 'japanese']）
    };
  };
  weight?: number | string; // フォントウェイト
  size?: number; // フォントサイズ
  imageSrc?: string; // type="image"の場合
  width?: number; // 画像用width追加
  height?: number; // 画像用height追加
  density?: number; // パーティクル密度（値が小さいほど密度が高い）
  scale?: number; // パーティクルサイズ倍率
  blur?: number; // ブラー効果の強度
  mouseRadius?: number; // マウス影響範囲半径
  friction?: number; // 摩擦係数 (0-1)
  moveSpeed?: number; // 元の位置に戻る力の強さ
  tint?: number; // パーティクルの色 (hex) - 非推奨
  color?: number; // パーティクルの色 (hex) - 推奨
  threshold?: number; // 闾値フィルターの闾値 (0-1)
  // ブレイクポイント設定
  breakpoints?: {
    [width: number]: BreakpointSettings;
  };
}

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
  readonly radius: number; // 衝突判定半径
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
  texture?: any; // PIXI.Textureの型（PIXIの型をここで直接importしないため）
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
export type ParticleEventListener = (...args: any[]) => void;
