varying vec2 vUv;
uniform float uTime;

// ランダム関数
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 2D ノイズ関数
float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vUv = uv;

  vec3 pos = position;

  // ノイズを使った位置のオフセット
  float n = noise(position.xy * 2.0 + uTime * 0.5);
  pos.z += n * 0.0; // Z方向にノイズを適用
  pos.xy += vec2(
    noise(position.xy * 3.0 + uTime * 0.3),
    noise(position.yx * 3.0 + uTime * 0.3)
  ) * 0.1; // XY方向に微妙なノイズ

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  // パーティクルサイズもノイズで変化
  float sizeNoise = noise(position.xy * 5.0 + uTime * 0.2);
  gl_PointSize = 10.0 + sizeNoise * 2.0;
}
