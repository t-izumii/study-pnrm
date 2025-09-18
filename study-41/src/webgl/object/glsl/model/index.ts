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
    this.unsubscribes.push(scrollUnsubscribe, viewportUnsubscribe);
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
