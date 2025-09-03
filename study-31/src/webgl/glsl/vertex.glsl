varying vec2 vUv;
uniform float uTime;
uniform float uProgress;

void main() {
  vUv = uv;
  vec3 pos = position;

  pos.z += sin(-pos.y * 0.005 + uProgress * 3.14159) * 8.0 * (1.0 - abs(uProgress - 0.5) * 2.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}