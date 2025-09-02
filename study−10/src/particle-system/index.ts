// ==========================================
// メインエクスポート（推奨）
// ==========================================

// ファサードパターン - 型安全なファクトリー
export { ParticleFactory } from "./core/ParticleFactory";

// 従来のメインクラス（後方互換性）
export { ParticleApp } from "./core/ParticleApp";

// プラグインシステム
export { PluginManager } from "./plugins/plugin-system";
export type { ParticlePlugin } from "./plugins/plugin-system";

// 組み込みプラグイン
export {
  PerformanceMonitorPlugin,
  KeyboardControlPlugin,
  StatsDisplayPlugin,
  registerBuiltInPlugins,
} from "./plugins/built-in-plugins";

// 開発ツール
export { DevTools } from "./dev-tools/dev-tools";

// ==========================================
// 名前空間エクスポート（新しい推奨方法）
// ==========================================

export * as Core from "./namespaces/core";
export * as Physics from "./namespaces/physics";
export * as Utils from "./namespaces/utils";
export * as Types from "./namespaces/types";
export * as Config from "./namespaces/config";

// ==========================================
// 直接エクスポート（後方互換性）
// ==========================================

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
  TextParticleOptions,
  ImageParticleOptions,
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
 * // 新しい推奨方法（型安全）
 * import { ParticleFactory } from './particle-system';
 * 
 * const app1 = ParticleFactory.createTextParticle('.text1', {
 *   text: 'Hello World',
 *   size: 100,
 *   color: 0xff0000
 * });
 * 
 * const app2 = ParticleFactory.createImageParticle('.image1', {
 *   imageSrc: '/image.png',
 *   width: 400
 * });
 * 
 * // 名前空間を使用した場合
 * import { Core, Utils, Types } from './particle-system';
 * const app = new Core.ParticleApp('.container', options);
 * 
 * // 開発ツールの使用
 * import { DevTools } from './particle-system';
 * DevTools.enable();
 * DevTools.enablePerformanceMonitoring(app);
 * DevTools.showDebugPanel(app);
 * 
 * // プラグインシステム
 * import { PluginManager, registerBuiltInPlugins } from './particle-system';
 * registerBuiltInPlugins();
 * PluginManager.attachToApp(app, 'performance-monitor');
 */
