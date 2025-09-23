import { WebGLRenderer, Scene, PerspectiveCamera } from "three";
import { ObjectManager } from "./ObjectManager";
import { globalState } from "../states";

export class WebGLApplication {
  private renderer: WebGLRenderer;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private objectManager: ObjectManager;
  private hasLoggedRender = false;

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
    renderer.setClearColor(0x222222, 1);
    renderer.outputColorSpace = "srgb";

    return renderer;
  }

  private createCamera(): PerspectiveCamera {
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 2000;

    const camera = new PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

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
    
    // ModelObjectにシーンを設定
    this.objectManager.objects.forEach((obj: any) => {
      if (obj.setScene) {
        obj.setScene(this.scene);
      }
    });
    
    this.render();
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render());
  }
}
