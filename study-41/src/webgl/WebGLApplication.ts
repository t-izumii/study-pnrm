import { WebGLRenderer, Scene, PerspectiveCamera } from "three";
import { ObjectManager } from "./ObjectManager";
import { globalState } from "../states";

export class WebGLApplication {
  private renderer: WebGLRenderer;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private objectManager: ObjectManager;

  constructor() {
    this.renderer = this.createRenderer();
    this.scene = new Scene();
    this.camera = this.createCamera();
    this.objectManager = new ObjectManager(this.scene, this.renderer);

    this.setupCanvas();
    this.setupResize();
  }

  private createRenderer(): WebGLRenderer {
    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = "srgb";
    
    return renderer;
  }

  private createCamera(): PerspectiveCamera {
    const distance = 1000;
    const aspect = window.innerWidth / window.innerHeight;
    const fov = 2 * Math.atan(window.innerHeight / 2 / distance) * (180 / Math.PI);

    const camera = new PerspectiveCamera(fov, aspect, 0.1, distance * 2);
    camera.position.z = distance;
    
    return camera;
  }

  private setupCanvas() {
    this.renderer.domElement.style.position = "fixed";
    this.renderer.domElement.style.top = "0";
    this.renderer.domElement.style.left = "0";
    this.renderer.domElement.style.zIndex = "-1";
    document.body.appendChild(this.renderer.domElement);
  }

  private setupResize() {
    globalState.viewport.subscribe(() => {
      this.renderer.setSize(globalState.viewport.width, globalState.viewport.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      const distance = this.camera.position.z;
      const fov = 2 * Math.atan(globalState.viewport.height / 2 / distance) * (180 / Math.PI);
      this.camera.aspect = globalState.viewport.width / globalState.viewport.height;
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    });
  }

  async start() {
    await this.objectManager.init();
    this.render();
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render());
  }
}
