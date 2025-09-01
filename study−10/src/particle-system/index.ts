export { Particle } from "./core/Particle";
export { ParticleSystem } from "./core/ParticleSystem";
export { MouseInteraction } from "./physics/MouseInteraction";
export { TextureGenerator } from "./core/TextureGenerator";
export { FilterManager } from "./core/FilterManager";
export { ParticleApp } from "./core/ParticleApp";
export { FontLoader } from "./utils/FontLoader";

// リファクタリングで追加されたマネージャークラス
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

// 型定義
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
