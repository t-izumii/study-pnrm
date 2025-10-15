uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
  // パーティクルを円形にする（gl_PointCoordを使用）
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(gl_PointCoord, center);

  // 半径0.5の円の外側を破棄
  if (dist > 0.5) {
    discard;
  }

  // テクスチャの色を取得（vUvを使用）
  vec4 color = texture2D(uTexture, vUv);

  // 輝度計算（人間の目の感度に基づいた正確な計算）
  float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));

  // 白に近い色（輝度が0.995以上）を透明にする
  if (luminance > 0.999) {
    discard; // このピクセルを描画しない
  }

  gl_FragColor = vec4(luminance, luminance, luminance, 1.0);
}
