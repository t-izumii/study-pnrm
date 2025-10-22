import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Reflector } from "three/addons/objects/Reflector.js";
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
  private mirrorMesh: any;
  private reflector: Reflector;

  constructor() {
    this.modelCover = null;
    this.modelCoverOpenRad = -Math.PI / 2.5;
    this.modelCoverCloseRad = 0;
    this.mirrorMesh = null;

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

    // 環境光（ベースの明るさ）
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);

    // メインライト（上から柔らかく）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(2, 3, 2);
    this.scene.add(directionalLight);

    // リムライト（輪郭を美しく）
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(-1, 1, -1);
    this.scene.add(rimLight);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0xffffff, 1);
    // トーンマッピングで高級感のある描画
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  loadModel() {
    const loader = new GLTFLoader();
    loader.load("/model.glb", (gltf) => {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          console.log(child.name);

          // マテリアルに光沢感を追加
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => {
                if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
                  mat.metalness = 0.7;
                  mat.roughness = 0.25;
                }
              });
            } else {
              if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
                child.material.metalness = 0.7;
                child.material.roughness = 0.25;
              }
            }
          }

          if (child.name === "Couvercle") {
            child.rotation.x = 0;
            this.modelCover = child;
          }

          if (child.name === "Mirror") {
            // Mirrorメッシュを保存
            this.mirrorMesh = child;

            // 元のメッシュのジオメトリとトランスフォームを取得
            const geometry = child.geometry;

            // Reflectorを作成
            this.reflector = new Reflector(geometry, {
              clipBias: 0.063,
              textureWidth: window.innerWidth * window.devicePixelRatio,
              textureHeight: window.innerHeight * window.devicePixelRatio,
              color: 0xffffff,
            });

            // 元のメッシュの位置・回転・スケールをReflectorにコピー
            this.reflector.position.copy(child.position);
            this.reflector.position.y -= 0.006;
            this.reflector.rotation.copy(child.rotation);
            this.reflector.scale.copy(child.scale);

            // 元のメッシュを非表示にしてReflectorを追加
            child.visible = false;
            child.parent?.add(this.reflector);

            // Reflectorの内部設定をカスタマイズ
            // @ts-ignore - Reflectorの内部プロパティにアクセス
            if (this.reflector.material) {
              // @ts-ignore
              this.reflector.material.side = THREE.DoubleSide;
            }

            console.log("Mirror setup complete with Reflector");
          }
        }
      });

      this.mesh = gltf.scene;
      this.mesh.scale.set(4, 4, 4);
      this.mesh.position.y = -0.1;
      this.mesh.rotation.y = -Math.PI / 6;
      this.mesh.rotation.x = Math.PI / 6;
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
