import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Reflector } from "three/addons/objects/Reflector.js";
import gsap from "gsap";
export class WebGLApp {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private group: THREE.Group;
  private positionGroup: THREE.Group;
  private dragGroup: THREE.Group;
  private mesh: THREE.Mesh;
  private modelCover: any;
  private modelCoverOpenRad: any;
  private modelCoverCloseRad: any;
  private reflector: Reflector;
  private isDragging: boolean;
  private previousMousePosition: { x: number; y: number };
  private rotationVelocity: { x: number; y: number };
  private hasMoved: boolean;
  private itemArray: { [key: string]: THREE.Mesh[] }; // {baroque: [baroque-1, baroque-2, ...], stellaire: [...], ...}
  private itemTypes: string[] = ["baroque", "stellaire", "mad", "couture"];
  private activeIndex: number;

  constructor() {
    this.modelCover = null;
    this.modelCoverOpenRad = degToRad(-72);
    this.modelCoverCloseRad = degToRad(0);
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.rotationVelocity = { x: 0, y: 0 };
    this.hasMoved = false;
    this.itemArray = {
      baroque: [],
      stellaire: [],
      mad: [],
      couture: [],
    };
    this.activeIndex = 0;

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

    // 環境光（ベースの明るさ）- 影の部分も見えるように
    const ambientLight = new THREE.AmbientLight(0xffffff, 15);
    this.scene.add(ambientLight);

    // メインライト（上から柔らかく）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 6);
    directionalLight.position.set(2, 1, 2);
    this.scene.add(directionalLight);

    // メインライトのヘルパー（青色）
    const directionalLightHelper = new THREE.DirectionalLightHelper(
      directionalLight,
      1,
      0x0000ff
    );
    this.scene.add(directionalLightHelper);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 6);
    directionalLight2.position.set(-2, 1, -2);
    this.scene.add(directionalLight2);

    const directionalLightHelper2 = new THREE.DirectionalLightHelper(
      directionalLight2,
      1,
      0x00ffff
    );
    this.scene.add(directionalLightHelper2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0xffffff, 1);
    // トーンマッピングで高級感のある描画
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);
  }

  loadModel() {
    const loader = new GLTFLoader();
    loader.load("/model.glb", (gltf) => {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          // console.log(child.name);

          if (
            child.name === "Contenant" ||
            child.name === "Manche1" ||
            child.name === "Manche2" ||
            child.name === "Couvercle" ||
            child.name === "Mirror" ||
            child.name === "Clover"
          ) {
            child.material.color.set(0x111111); // 真っ黒より少し明るめ
            child.material.metalness = 0.2; // メタリック感を強く
            child.material.roughness = 0.4; // 光沢を強く（ツヤツヤに）
            child.castShadow = false; // 影を落とさない
            child.receiveShadow = false; // 影を受けない
          }

          if (child.name === "Couvercle") {
            child.rotation.x = 0;
            this.modelCover = child;
            // child.material.map = null; // テクスチャを外す
            // child.material.needsUpdate = true; // マテリアルを更新
          }

          if (child.name === "Mirror") {
            // 元のメッシュのジオメトリとトランスフォームを取得
            const geometry = child.geometry;

            // Reflectorを作成
            this.reflector = new Reflector(geometry, {
              clipBias: 0.045,
              textureWidth: window.innerWidth * window.devicePixelRatio,
              textureHeight: window.innerHeight * window.devicePixelRatio,
              color: 0xffffff,
            });

            // 元のメッシュの位置・回転・スケールをReflectorにコピー
            this.reflector.position.copy(child.position);
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
          }

          if (child.name === "Clover") {
            child.material.transparent = true;
            child.material.opacity = 0;
          }

          if (
            child.name.startsWith("baroque-") ||
            child.name.startsWith("stellaire-") ||
            child.name.startsWith("mad-") ||
            child.name.startsWith("couture-")
          ) {
            // アイテム名から種類を抽出 (baroque-1 → baroque)
            const itemType = child.name.split("-")[0];

            if (this.itemArray[itemType]) {
              this.itemArray[itemType].push(child as THREE.Mesh);
            }

            // 初期状態: すべて透過
            child.material.transparent = true;
            child.material.opacity = 0;
          }

          if (child.name.endsWith("-1")) {
            child.material.color.set(0xffb8b6);
          }
          if (child.name.endsWith("-2")) {
            child.material.color.set(0xffcdab);
          }
          if (child.name.endsWith("-3")) {
            child.material.color.set(0xffabd8);
          }
          if (child.name.endsWith("-4")) {
            child.material.color.set(0xd5ffab);
          }
        }
      });

      // 配列を番号順にソート
      Object.keys(this.itemArray).forEach((key) => {
        this.itemArray[key].sort((a, b) => {
          const numA = parseInt(a.name.split("-")[1]);
          const numB = parseInt(b.name.split("-")[1]);
          return numA - numB;
        });
      });

      this.mesh = gltf.scene;
      this.mesh.scale.set(3.5, 3.5, 3.5);
      this.mesh.position.z = -0.05;
      this.mesh.rotation.x = degToRad(110);

      // アニメーション用のグループ
      this.group = new THREE.Group();
      this.group.add(this.mesh);

      // ポジション調整用のグループ（中間層）
      this.positionGroup = new THREE.Group();
      this.positionGroup.rotation.x = degToRad(-80);
      this.positionGroup.rotation.z = degToRad(30);
      this.positionGroup.position.y = -0.1;
      this.positionGroup.add(this.group);

      // ドラッグ操作用のグループ（外側）
      this.dragGroup = new THREE.Group();
      this.dragGroup.add(this.positionGroup);
      this.scene.add(this.dragGroup);

      // 初期表示: baroqueを表示
      this.viewItem("baroque");

      // モデル読み込み完了後にアニメーション実行
      this.coverAnimation();
    });
  }

  viewItem(itemType: string) {
    // すべてのアイテムを非表示にする
    setTimeout(() => {
      Object.values(this.itemArray).forEach((meshArray) => {
        meshArray.forEach((mesh) => {
          mesh.visible = false;
          mesh.material.opacity = 0;
        });
      });

      // 指定されたアイテムタイプのすべてを表示
      if (this.itemArray[itemType]) {
        this.itemArray[itemType].forEach((mesh) => {
          mesh.visible = true;
          mesh.material.opacity = 1;
        });
      }
    }, 1000);
  }

  coverAnimation() {
    const timeline = gsap.timeline();

    timeline.add(() => this.closeAnimation());
    timeline.add(() => this.openAnimation(), "+=1.5");
  }

  rotateAnimation() {
    const timeline = gsap.timeline();

    // 回転する（x軸とz軸を同時に回転）
    timeline.to(this.group.rotation, {
      y: -Math.PI * 2,
      delay: 0.5,
      duration: 1.5,
      ease: "power2.inOut",
    });

    // 初期位置に戻す
    timeline.to(this.group.rotation, {
      y: 0,
      duration: 0,
    });
  }

  closeAnimation() {
    gsap.to(this.modelCover.rotation, {
      x: this.modelCoverCloseRad,
      duration: 1,
      ease: "power2.inOut",
    });

    gsap.to(this.positionGroup.rotation, {
      x: degToRad(-10),
      z: degToRad(10),
      duration: 1,
      ease: "power2.inOut",
    });

    gsap.to(this.positionGroup.position, {
      y: 0,
      duration: 1,
      ease: "power2.inOut",
    });

    gsap.to(this.dragGroup.rotation, {
      x: 0,
      y: 0,
      z: 0,
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

    gsap.to(this.positionGroup.rotation, {
      x: degToRad(-70),
      y: degToRad(20),
      z: degToRad(45),
      duration: 1,
      ease: "power2.inOut",
    });

    gsap.to(this.positionGroup.position, {
      y: -0.1,
      duration: 1,
      ease: "power2.inOut",
    });
  }

  setUpEventListener() {
    window.addEventListener("click", (e) => {
      // ドラッグ後のクリックは無視
      if (this.hasMoved) {
        return;
      }

      // アイテムタイプを切り替え
      this.activeIndex = (this.activeIndex + 1) % this.itemTypes.length; // 0→1→2→3→0と循環
      const currentItemType = this.itemTypes[this.activeIndex];
      this.viewItem(currentItemType);

      this.coverAnimation();
      this.rotateAnimation();
    });

    // マウスドラッグイベント
    window.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.hasMoved = false;
      this.previousMousePosition = {
        x: e.clientX,
        y: e.clientY,
      };
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging || !this.dragGroup) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      // マウスが移動したことを記録
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        this.hasMoved = true;
      }

      // 回転速度を設定
      this.rotationVelocity.y = deltaX * 0.005;
      this.rotationVelocity.x = deltaY * 0.005;

      // dragGroupを回転（ドラッグ操作）
      this.dragGroup.rotation.y += this.rotationVelocity.y;
      this.dragGroup.rotation.x += this.rotationVelocity.x;

      this.previousMousePosition = {
        x: e.clientX,
        y: e.clientY,
      };
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
      // 少し遅延させてからhasMovedをリセット
      setTimeout(() => {
        this.hasMoved = false;
      }, 100);
    });

    // タッチイベント（モバイル対応）
    window.addEventListener("touchstart", (e) => {
      this.isDragging = true;
      this.hasMoved = false;
      this.previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    });

    window.addEventListener("touchmove", (e) => {
      if (!this.isDragging || !this.dragGroup) return;

      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      // タッチが移動したことを記録
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        this.hasMoved = true;
      }

      this.rotationVelocity.y = deltaX * 0.005;
      this.rotationVelocity.x = deltaY * 0.005;

      // dragGroupを回転（ドラッグ操作）
      this.dragGroup.rotation.y += this.rotationVelocity.y;
      this.dragGroup.rotation.x += this.rotationVelocity.x;

      this.previousMousePosition = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    });

    window.addEventListener("touchend", () => {
      this.isDragging = false;
      setTimeout(() => {
        this.hasMoved = false;
      }, 100);
    });
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.clock.getElapsedTime();
    this.renderer.render(this.scene, this.camera);
  }
}

function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
