import * as THREE from "three";
import fragmentShader from "./glsl/fragment.glsl";
import vertexShader from "./glsl/vertex.glsl";

console.log(THREE);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x333333, 1);
document.body.appendChild(renderer.domElement);

// Create mesh
const width = 64; // 解像度
const height = 64;
const particleCount = width * height;

const positions = new Float32Array(particleCount * 3);
const uvs = new Float32Array(particleCount * 2);

// パーティクル間の間隔（ピクセル単位で配置）
const spacing = 0.25; // この値でサイズ調整可能

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 3;
    const uvIndex = (y * width + x) * 2;

    // グリッド状に配置（中心を原点として実際のサイズで配置）
    positions[i] = (x - width / 2) * spacing;
    positions[i + 1] = -(y - height / 2) * spacing; // Y軸反転
    positions[i + 2] = 0;

    // UV座標（0 〜 1の範囲）Y軸を反転
    uvs[uvIndex] = x / width;
    uvs[uvIndex + 1] = 1.0 - y / height; // 反転
  }
}

const geometryParticles = new THREE.BufferGeometry();
geometryParticles.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
geometryParticles.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

// 動画要素を作成
const video = document.createElement("video");
video.src = "/video_1.mp4";
video.loop = true;
video.muted = true;
video.playsInline = true;
video.play();

// VideoTextureを作成
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;

const material = new THREE.ShaderMaterial({
  uniforms: {
    uTexture: { value: videoTexture },
    uTime: { value: 0.0 },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  transparent: true,
});
const particles = new THREE.Points(geometryParticles, material);
scene.add(particles);

function animate() {
  requestAnimationFrame(animate);

  // 時間を更新
  material.uniforms.uTime.value += 0.01;

  renderer.render(scene, camera);
}

animate();
