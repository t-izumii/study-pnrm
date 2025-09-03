uniform float uTime;
uniform float uProgress;
uniform vec2 uResolution;
varying vec2 vUv;
uniform sampler2D uTexture;

#define PI 3.141592653589793

float random(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}


void main() {
  vec2 uv = vUv;

  float div = 16.0;
  vec2 duv = floor(uv * div) / div;

  float p = pow(uv.y, 2.0);
  float a1 = clamp((uProgress * 2.0 - p), 0.0, 1.0);

  // ランダム値を生成
  float r1 = random(gl_FragCoord.xy);
  float r2 = random(gl_FragCoord.xy + vec2(1000.0));

  // 極座標→直交座標
  float ax = r1 * cos(r2 * 2.0 * PI);
  float ay = r1 * sin(r2 * 2.0 * PI);

  // UV座標への適用
  uv.x += (1.0 - a1) * 0.1 * ax;
  uv.y += (1.0 - a1) * 0.1 * ay;

  // RGB色収差エフェクト
  float r = texture2D(uTexture, uv + vec2(0.0, 0.05 * (1.0 - a1))).r;
  float g = texture2D(uTexture, uv).g;
  float b = texture2D(uTexture, uv + vec2(0.0, -0.05 * (1.0 - a1))).b;
  vec4 color = vec4(r, g, b, 1.0);

  // グレースケール変換
  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));

  // 色の計算
  vec4 result = mix(vec4(vec3(gray), 1.0), color, pow(a1, 3.0));
  result.a *= a1;
  gl_FragColor = result;
}