import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { Group, Object3D, WebGLRenderer } from "three";
import { globalState } from "../../../../states";

export default class ModelObject {
  el: HTMLElement;
  model: Group | null = null;
  loader: GLTFLoader;
  rect: DOMRect;
  unsubscribes: (() => void)[] = [];
  targetRotationX = 0;
  targetRotationY = 0;
  currentRotationX = 0;
  currentRotationY = 0;

  constructor(el: HTMLElement) {
    this.el = el;
    this.rect = this.el.getBoundingClientRect();
    this.loader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
    );
    this.loader.setDRACOLoader(dracoLoader);
  }

  setRenderer(renderer: WebGLRenderer) {
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath(
      "https://www.gstatic.com/basis-universal/versioned/2021-04-15-ba1c3e4/"
    );
    ktx2Loader.detectSupport(renderer);
    this.loader.setKTX2Loader(ktx2Loader);
  }

  async init() {
    try {
      const gltf = await this.loader.loadAsync("/white_rapid2.glb");
      this.model = gltf.scene;

      this.updateTransform();
      this.setupStateListeners();
      this.startAnimationLoop();
    } catch (error) {
      console.error("Failed to load GLB model:", error);
    }
  }

  setupStateListeners() {
    const scrollUnsubscribe = globalState.scroll.subscribe(() =>
      this.updateTransform()
    );
    const viewportUnsubscribe = globalState.viewport.subscribe(() =>
      this.updateTransform()
    );
    const mouseUnsubscribe = globalState.mouse.subscribe(() =>
      this.updateRotation()
    );
    this.unsubscribes.push(
      scrollUnsubscribe,
      viewportUnsubscribe,
      mouseUnsubscribe
    );
  }

  updateTransform() {
    if (!this.model) return;

    this.rect = this.el.getBoundingClientRect();

    const centerX =
      this.rect.left + this.rect.width / 2 - globalState.viewport.width / 2;
    const centerY = -(
      this.rect.top +
      this.rect.height / 2 -
      globalState.viewport.height / 2
    );
    const scale = (Math.min(this.rect.width, this.rect.height) / 200) * 50;

    this.model.position.set(centerX, centerY, 0);
    this.model.scale.setScalar(scale);
  }

  updateRotation() {
    const mouseX = globalState.mouse.x;
    const mouseY = globalState.mouse.y;

    // マウス位置を-1から1の範囲に正規化
    const normalizedX = (mouseX / globalState.viewport.width) * 2 - 1;
    const normalizedY = (mouseY / globalState.viewport.height) * 2 - 1;

    // マウス位置に基づいて目標回転角度を設定
    const rotationIntensity = 0.8;
    this.targetRotationY = normalizedX * rotationIntensity;
    this.targetRotationX = normalizedY * rotationIntensity;
  }

  startAnimationLoop() {
    const animate = () => {
      if (this.model) {
        // 線形補間でスムーズな回転
        const lerpFactor = 0.1;
        this.currentRotationX +=
          (this.targetRotationX - this.currentRotationX) * lerpFactor;
        this.currentRotationY +=
          (this.targetRotationY - this.currentRotationY) * lerpFactor;
        this.model.rotation.set(
          this.currentRotationX,
          this.currentRotationY,
          0
        );
      }
      requestAnimationFrame(animate);
    };
    animate();
  }

  updateGeometry() {
    this.updateTransform();
  }

  get mesh(): Object3D {
    return this.model || new Group();
  }

  destroy() {
    this.unsubscribes.forEach((fn) => fn());
    this.unsubscribes = [];

    if (this.model) {
      this.model.traverse((child: any) => {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((mat: any) => mat.dispose());
        } else {
          child.material?.dispose();
        }
      });
    }
  }
}
