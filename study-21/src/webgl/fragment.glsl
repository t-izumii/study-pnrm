precision highp float;

uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uTime;
uniform float uDistortion;
uniform vec2 uTextureSize;  // テクスチャの実際のサイズ
uniform vec2 uPlaneSize;    // 表示領域のサイズ
uniform vec2 uVelocity;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;

    // テクスチャと表示領域のアスペクト比を計算
    float textureAspect = uTextureSize.x / uTextureSize.y;
    float planeAspect = uPlaneSize.x / uPlaneSize.y;

    // object-fit: contain の実装
    vec2 scale = vec2(1.0);
    vec2 offset = vec2(0.0);

    if (planeAspect > textureAspect) {
        // 表示領域が横に広い場合（左右に余白）
        scale.x = textureAspect / planeAspect;
        offset.x = (1.0 - scale.x) * 0.5;
    } else {
        // 表示領域が縦に長い場合（上下に余白）
        scale.y = planeAspect / textureAspect;
        offset.y = (1.0 - scale.y) * 0.5;
    }

    // UV座標を調整
    vec2 adjustedUv = (uv - offset) / scale;

    // 調整されたUV座標が範囲外の場合は透明にする
    if (adjustedUv.x < 0.0 || adjustedUv.x > 1.0 ||
        adjustedUv.y < 0.0 || adjustedUv.y > 1.0) {
        discard;
    }

    // テクスチャをサンプリング
    vec4 color = texture2D(uTexture, adjustedUv);

    // アルファチャンネルの処理を改善
    // アルファが低い値の場合は完全に透明にする（アンチエイリアスのエッジを除去）
    float alphaThreshold = 0.1;  // より高い閾値でエッジをシャープに
    if (color.a < alphaThreshold) {
        discard;
    }



    // アルファを1.0に強制してエッジをクリーンに
    gl_FragColor = vec4(color.rgb, 1.0);
}
