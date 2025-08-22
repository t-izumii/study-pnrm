// Configuration constants without type dependencies to avoid circular imports

export const PARTICLE_CONFIG = {
  friction: 0.86,
  moveSpeed: 0.1,
  scale: 0.2,
  tint: 0x000000,
  radius: 10,
} as const;

export const TEXT_CONFIG = {
  fontSize: 300,
  fontName: 'Hind',
  density: 2,
  defaultText: 'PNRM',
} as const;

export const RENDERER_CONFIG = {
  antialias: false,
  resolution: (window.devicePixelRatio > 1) ? 2 : 1,
  autoDensity: true,
  powerPreference: "high-performance" as const,
  backgroundColor: 0xffffff,
} as const;

export const FILTER_CONFIG = {
  blur: 10,
  threshold: 0.5,
  mr: 0.0 / 255.0,
  mg: 0.0 / 255.0,
  mb: 0.0 / 255.0,
} as const;

export const FONT_CONFIG = {
  familyName: "Noto Sans JP",
  googleApiUrl: "https://fonts.googleapis.com/css?family=",
} as const;

export const MOUSE_CONFIG = {
  radius: 100,
} as const;
