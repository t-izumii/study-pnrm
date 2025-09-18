import { PlaneGeometry, ShaderMaterial, Mesh, Vector2 } from "three";
import { globalState } from "../../states";

export abstract class WebGLObject {
  el: HTMLElement;
  vertexShader!: string;
  fragmentShader!: string;
  uniforms!: Record<string, { value: any }>;
  geometry!: PlaneGeometry;
  material!: ShaderMaterial;
  mesh!: Mesh;
  rect: DOMRect;
  unsubscribes: (() => void)[] = [];

  constructor(el: HTMLElement) {
    this.el = el;
    this.rect = this.el.getBoundingClientRect();
    this.setupGeometry();
  }

  init() {
    this.vertexShader = this.setupVertex();
    this.fragmentShader = this.setupFragment();
    this.uniforms = this.setupUniforms();
    this.material = this.setupMaterial();
    this.mesh = this.setupMesh(this.geometry, this.material);
    this.updatePosition();
    this.setupStateListeners();
  }

  setupStateListeners() {
    try {
      const scrollUnsubscribe = globalState.scroll.subscribe(() => {
        this.updatePosition();
      });

      const viewportUnsubscribe = globalState.viewport.subscribe(() => {
        this.updateGeometry();
        this.updatePosition();
      });

      this.unsubscribes.push(scrollUnsubscribe, viewportUnsubscribe);
    } catch (error) {
      console.error("Failed to setup state listeners:", error);
    }
  }

  updateGeometry() {
    this.rect = this.el.getBoundingClientRect();

    if (this.geometry) {
      this.geometry.dispose();
    }

    this.geometry = new PlaneGeometry(this.rect.width, this.rect.height, 1, 1);

    if (this.mesh) {
      this.mesh.geometry = this.geometry;
    }
  }

  updatePosition() {
    this.rect = this.el.getBoundingClientRect();

    // DOM要素の中心位置を計算（スクロールとビューポートを考慮）
    const centerX =
      this.rect.left + this.rect.width / 2 - globalState.viewport.width / 2;
    const centerY = -(
      this.rect.top +
      this.rect.height / 2 -
      globalState.viewport.height / 2
    );

    if (this.mesh) {
      this.mesh.position.set(centerX, centerY, 0);
    }
  }

  destroy() {
    this.unsubscribes.forEach((unsubscribe) => unsubscribe());
    this.unsubscribes = [];

    if (this.geometry) {
      this.geometry.dispose();
    }

    if (this.material) {
      this.material.dispose();
    }
  }

  setupGeometry() {
    this.geometry = new PlaneGeometry(this.rect.width, this.rect.height, 1, 1);
  }

  setupMaterial() {
    return new ShaderMaterial({
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      alphaTest: 0.5,
    });
  }

  setupMesh(geometry: PlaneGeometry, material: ShaderMaterial) {
    return (this.mesh = new Mesh(geometry, material));
  }

  abstract setupVertex(): string;

  abstract setupFragment(): string;

  setupUniforms() {
    return {
      uTick: { value: 0 },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uProgress: { value: 0 },
    };
  }
}