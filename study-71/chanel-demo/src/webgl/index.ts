import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";

console.log(THREE);

export class WebGLApp {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private mesh: THREE.Mesh;
  private controls: OrbitControls;
  private modelCover: any;
  private modelCoverOpenRad: any;
  private modelCoverCloseRad: any;

  constructor() {
    this.modelCover = null;
    this.modelCoverOpenRad = null;
    this.modelCoverCloseRad = 0;

    this.clock = new THREE.Clock();
    this.init();
    this.loadModel();
    this.setUpEventListener();
    this.animate();
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 1;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 1, 0);
    this.scene.add(pointLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 1, 0);
    this.scene.add(spotLight);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  loadModel() {
    const loader = new GLTFLoader();
    loader.load("/model.glb", (gltf) => {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          console.log(child.name);

          if (child.name === "Couvercle") {
            this.modelCoverOpenRad = child.rotation.x;
            child.rotation.x = 0;
            this.modelCover = child;
          }
        }
      });

      this.mesh = gltf.scene;
      this.mesh.scale.set(4, 4, 4);
      this.mesh.position.y = -0.1;
      this.mesh.rotation.y = -Math.PI / 6;
      this.mesh.rotation.x = Math.PI / 8;
      this.scene.add(this.mesh);

      // モデル読み込み完了後にアニメーション実行
      this.coverAnimation();
    });
  }

  coverAnimation() {
    const timeline = gsap.timeline();

    timeline.add(() => this.closeAnimation());
    timeline.add(() => this.openAnimation(), "+=1");
  }

  rotateAnimation() {
    const timeline = gsap.timeline();

    // 回転する
    timeline.to(this.mesh.rotation, {
      y: -Math.PI / 6 + -Math.PI * 2,
      delay: 0.5,
      duration: 1,
      ease: "power2.inOut",
    });

    // 初期位置に戻す
    timeline.to(this.mesh.rotation, {
      y: -Math.PI / 6,
      duration: 0,
    });
  }

  closeAnimation() {
    gsap.to(this.modelCover.rotation, {
      x: this.modelCoverCloseRad,
      duration: 1,
      ease: "power2.inOut",
    });
  }

  openAnimation() {
    gsap.to(this.modelCover.rotation, {
      x: this.modelCoverOpenRad,
      duration: 1,
      ease: "power2.inOut",
    });
  }

  setUpEventListener() {
    window.addEventListener("click", () => {
      this.coverAnimation();
      this.rotateAnimation();
    });
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.clock.getElapsedTime();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
