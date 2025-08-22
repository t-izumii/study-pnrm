/**
 * アプリケーション全体の設定値を管理するファイル
 * 全ての定数をここに集約することで、設定変更が容易になります
 */

// パーティクルの物理的な動作に関する設定
export const PARTICLE_CONFIG = {
  friction: 0.86,      // 摩擦係数（0-1の範囲、値が小さいほど抵抗が大きい）
  moveSpeed: 0.1,      // 元の位置に戻る力の強さ
  scale: 0.2,          // パーティクルの表示サイズ倍率
  tint: 0x000000,      // パーティクルの色（黒色）
  radius: 10,          // パーティクルの衝突判定半径
} as const;

// テキスト生成に関する設定
export const TEXT_CONFIG = {
  fontSize: 300,       // フォントサイズ（ピクセル単位）
  fontName: 'Hind',    // 使用するフォント名
  density: 2,          // パーティクルの密度（値が小さいほど密度が高い）
  defaultText: 'PNRM', // 表示するデフォルトテキスト
} as const;

// PIXI.jsレンダラーの設定
export const RENDERER_CONFIG = {
  antialias: false,                                      // アンチエイリアス無効（パフォーマンス優先）
  resolution: (window.devicePixelRatio > 1) ? 2 : 1,   // 高DPIディスプレイ対応
  autoDensity: true,                                     // 自動的にCSS密度を調整
  powerPreference: "high-performance" as const,         // GPU使用を優先
  backgroundColor: 0xffffff,                             // 背景色（白色）
} as const;

// シェーダーフィルターの設定
export const FILTER_CONFIG = {
  blur: 1,             // ブラーエフェクトの強度
  threshold: 0.5,      // 閾値フィルターの境界値
  mr: 0.0 / 255.0,     // 赤色成分（0-1の範囲）
  mg: 0.0 / 255.0,     // 緑色成分（0-1の範囲）
  mb: 0.0 / 255.0,     // 青色成分（0-1の範囲）
} as const;

// フォント読み込みに関する設定
export const FONT_CONFIG = {
  familyName: "Noto Sans JP",                            // Google Fontsから読み込むフォント名
  googleApiUrl: "https://fonts.googleapis.com/css?family=", // Google Fonts API のベースURL
} as const;

// マウスインタラクションの設定
export const MOUSE_CONFIG = {
  radius: 50,          // マウスカーソルの影響範囲半径
} as const;
