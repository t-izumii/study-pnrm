/**
 * パーティクルシステムで使用する型定義
 */

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
