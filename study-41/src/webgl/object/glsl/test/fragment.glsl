varying vec2 vUv;
uniform vec2 uMouse;
uniform vec4 uResolution;
uniform float uEdge;
uniform sampler2D tex1;
uniform sampler2D tex2;

vec2 coverUv(vec2 uv, vec4 resolution) {
    return (uv - .5) * resolution.zw + .5;
}

void main() {
    vec4 color = vec4(0.0, 1.0, 1.0, 1.0);
    gl_FragColor = color;
}