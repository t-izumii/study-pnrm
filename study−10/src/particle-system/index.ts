// メインエクスポート
export { ParticleApp } from "./core/ParticleApp";

// コアシステム
export { Particle } from "./core/Particle";
export { ParticleSystem } from "./core/ParticleSystem";
export { MouseInteraction } from "./physics/MouseInteraction";
export { TextureGenerator } from "./core/TextureGenerator";
export { FilterManager } from "./core/FilterManager";
export { FontLoader } from "./utils/FontLoader";

// マネージャークラス
export {
  SettingsManager,
  SettingsApplicator,
  FontManager,
  EventManager,
  type ResolvedSettings,
  type ResolvedFontConfig,
} from "./core/managers";

// エラーハンドリング
export {
  ParticleSystemError,
  InitializationError,
  ConfigurationError,
  RenderingError,
  ResourceError,
  ValidationError,
  SettingsValidator,
} from "./utils/errors";

// 型定義（新しい型安全性向上版を含む）
export type {
  Position,
  MouseState,
  Force,
  ParticleAppOptions,
  BreakpointSettings,
  GoogleFontConfig,
  FontConfig,
  ParticleType,
  ParticleEventType,
  ParticleEventListener,
  DebugInfo,
  ParticleError,
  ValidationResult,
  PerformanceInfo,
} from "./types/particle-types";

// 設定定数
export {
  PARTICLE_CONFIG,
  MOUSE_CONFIG,
  PARTICLE_GENERATION_CONFIG,
  FILTER_CONFIG,
  RENDERER_CONFIG,
} from "./config/particle-config";

// ==========================================
// 使用例とドキュメント
// ==========================================

/**
 * 使用例:
 * 
 * // 従来の方法（後方互換性）
 * import { ParticleApp } from './particle-system';
 * const app = new ParticleApp('.container', {
 *   type: 'text',
 *   text: 'Hello',
 *   size: 100
 * });
 */
