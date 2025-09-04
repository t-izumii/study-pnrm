varying vec2 vUv;
uniform float uTime;
uniform float uProgress;

void main() {
  vUv = uv;
  vec3 pos = position;

  pos.z += sin(-pos.y * 0.005 + uProgress * 3.14159) * (1.0 - abs(uProgress - 0.5) * 2.0) * 8.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

// pos.z += sin(-pos.y * 0.005 + uProgress * 3.14159) * (1.0 - abs(uProgress - 0.5) * 2.0) * 8.0;

// uProgress = 0.0 → sin(-pos.y * 0.005 + 0)     = 元の波
// uProgress = 0.5 → sin(-pos.y * 0.005 + 1.57)  = 波が90度ずれる
// uProgress = 1.0 → sin(-pos.y * 0.005 + 3.14)  = 波が180度ずれる（反転）

// πは180度

// 時間 0.0: sin(0 + 0度)   = sin(0)   = 0
// 時間 0.5: sin(0 + 90度)  = sin(π/2) = 1    ← 最大値
// 時間 1.0: sin(0 + 180度) = sin(π)   = 0

//　(1.0 - abs(uProgress - 0.5) * 2.0) * 8.0
// uProgress = 0.0 → 1.0 - 1.0 = 0.0  ← 効果なし
// uProgress = 0.5 → 1.0 - 0.0 = 1.0  ← 最大効果
// uProgress = 1.0 → 1.0 - 1.0 = 0.0  ← 効果なし