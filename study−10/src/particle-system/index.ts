export { Particle } from "./core/Particle";
export { ParticleSystem } from "./core/ParticleSystem";
export { MouseInteraction } from "./physics/MouseInteraction";
export { TextureGenerator } from "./core/TextureGenerator";
export { FilterManager } from "./core/FilterManager";
export { ParticleApp } from "./core/ParticleApp";

export type { Position, MouseState, Force } from "./types/particle-types";

export {
  PARTICLE_CONFIG,
  MOUSE_CONFIG,
  PARTICLE_GENERATION_CONFIG,
  FILTER_CONFIG,
  RENDERER_CONFIG,
} from "./config/particle-config";
