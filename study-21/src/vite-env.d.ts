/// <reference types="vite/client" />

// GLSL ファイルの型定義
declare module '*.glsl' {
  const value: string;
  export default value;
}

declare module '*.glsl?raw' {
  const value: string;
  export default value;
}

declare module '*.vert' {
  const value: string;
  export default value;
}

declare module '*.frag' {
  const value: string;
  export default value;
}

// Three.js の型定義を拡張
declare module 'three' {
  export * from 'three/src/Three.js';
}
