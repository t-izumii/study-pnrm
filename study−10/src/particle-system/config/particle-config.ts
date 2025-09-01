/**
 * パーティクルの生成パラメータ
 */
export const PARTICLE_GENERATION_CONFIG = {
  density: 2, // パーティクルの密度（値が小さいほど密度が高い）
} as const;

/**
 * パーティクルの物理的な動作パラメータ
 */
export const PARTICLE_CONFIG = {
  friction: 0.86, // 摩擦係数（0-1の範囲、値が小さいほど抵抗が大きい）
  moveSpeed: 0.1, // 元の位置に戻る力の強さ
  scale: 3, // パーティクルの表示サイズ倍率
  tint: 0x000000, // パーティクルの色（黒色）
} as const;

/**
 * マウスインタラクションの設定
 */
export const MOUSE_CONFIG = {
  radius: 50, // マウスカーソルの影響範囲半径
} as const;

/**
 * ビジュアルフィルターの設定
 */
export const FILTER_CONFIG = {
  blur: 5, // ブラー効果の強度
  threshold: 0.8, // 閾値フィルターの閾値
  mr: 0.0, // 閾値フィルター色（赤成分）
  mg: 0.0, // 閾値フィルター色（緑成分）
  mb: 0.0, // 閾値フィルター色（青成分）
} as const;

/**
 * レンダラーの設定
 */
export const RENDERER_CONFIG = {
  antialias: true, // アンチエイリアシング有効
  transparent: true, // 透明度有効
  resolution: Math.min(window.devicePixelRatio || 1, 2), // デバイス解像度対応（モバイル対応で上限2）
  autoDensity: true, // 自動密度調整
  forceCanvas: false, // WebGL優先、フォールバックでCanvas2D
  powerPreference: "high-performance", // GPU性能優先
} as const;
