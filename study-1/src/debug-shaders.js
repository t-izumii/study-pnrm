/**
 * ブラー処理によるアルファ値変化のデモ用シェーダー
 * アルファ値を色で可視化して、ブラーの効果を確認できます
 */

// デバッグ用：アルファ値を可視化するシェーダー
const alphaVisualizationShader = `
precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {
  vec4 color = texture2D(uSampler, vTextureCoord);
  
  // アルファ値によって色分けして表示
  if (color.a > 0.8) {
    // 高いアルファ値 → 赤色
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  } else if (color.a > 0.6) {
    // 中程度のアルファ値 → 黄色
    gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
  } else if (color.a > 0.4) {
    // 低めのアルファ値 → 緑色
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
  } else if (color.a > 0.2) {
    // 非常に低いアルファ値 → 青色
    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
  } else {
    // ほぼ透明 → 黒色
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
}
`;

// アルファ値の分布を数値で表示
const alphaDebugShader = `
precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {
  vec4 color = texture2D(uSampler, vTextureCoord);
  
  // アルファ値をそのままRGBに変換（グレースケール表示）
  float alpha = color.a;
  gl_FragColor = vec4(alpha, alpha, alpha, 1.0);
  
  // 結果：
  // 白い部分 = アルファ値が高い（不透明）
  // 黒い部分 = アルファ値が低い（透明）
  // グレー部分 = 中間のアルファ値（ブラーで作成された部分）
}
`;
