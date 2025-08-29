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
  scale: 0.1, // パーティクルの表示サイズ倍率
  tint: 0x000000, // パーティクルの色（黒色）
  radius: 10, // パーティクルの衝突判定半径
} as const;

/**
 * マウスインタラクションの設定
 */
export const MOUSE_CONFIG = {
  radius: 50, // マウスカーソルの影響範囲半径
} as const;
