import CreateCamera from "./camera";
import CreateScene from "./scene";
import CreateRenderer from "./renderer";
import CreateObject from "./objects";
import CreateGUI from "./gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class WebGLApp {
  camera: any;
  scene: any;
  renderer: any;
  objects: any[];
  gui: any;
  controls: OrbitControls;
  animate: any;
  element: HTMLElement;
  width: number;
  height: number;
  progressTarget: number = 1;
  progressCurrent: number = 1;

  constructor(element: HTMLElement, width: number, height: number) {
    this.element = element;
    this.width = width;
    this.height = height;
    this.objects = [];
    this.init();
    this.start();
  }

  init() {
    const createCamera = new CreateCamera(this.width, this.height);
    this.camera = createCamera.init();

    const createScene = new CreateScene();
    this.scene = createScene.init();

    const createRenderer = new CreateRenderer(this.width, this.height);
    this.renderer = createRenderer.init();
    this.element.appendChild(this.renderer.domElement);

    const createGUI = new CreateGUI();
    this.gui = createGUI.init();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.setup();
  }

  setup() {
    const dataWebgls = document.querySelectorAll("[data-webgl]");
    Array.from(dataWebgls).map((el) => {
      const createObject = new CreateObject(el, this.width, this.height);
      const object = createObject.init();

      this.scene.add(object);
      this.objects.push(createObject);
    });

    this.setupGUI();
  }

  setupGUI() {
    if (this.objects.length > 0 && this.objects[0].material) {
      const folder = this.gui.addFolder("Shader Controls");

      const progressControl = {
        startProgress: () => {
          this.progressCurrent = 0.0;
          this.progressTarget = 1.0;
        },
      };

      folder.add(progressControl, "startProgress").name("Start Progress");

      folder.open();
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    const startTime = performance.now();
    const animate = () => {
      const currentTime = (performance.now() - startTime) * 0.001;

      // Progress interpolation
      const lerpSpeed = 0.04;
      this.progressCurrent +=
        (this.progressTarget - this.progressCurrent) * lerpSpeed;

      this.controls.update();

      this.objects.forEach((obj) => {
        obj.update(this.width, this.height, currentTime);
        if (obj.material) {
          obj.material.uniforms.uProgress.value = this.progressCurrent;
        }
      });

      this.render();
      requestAnimationFrame(animate);
    };

    animate();
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }
}

export default WebGLApp;
