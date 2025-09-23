import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { Group, Object3D, WebGLRenderer, SkeletonHelper, SphereGeometry, MeshBasicMaterial, Mesh, Vector3, BufferGeometry, LineBasicMaterial, Line } from "three";
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
  skeletonHelpers: SkeletonHelper[] = [];
  boneSpheres: Mesh[] = [];
  boneLines: Line[] = []; // ボーン間の線
  scene: any = null;

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

  visualizeBones() {
    if (!this.model) return;

    let skinnedMeshCount = 0;
    let totalBones = 0;

    // 球体ジオメトリとマテリアルを作成
    const sphereGeometry = new SphereGeometry(0.5, 8, 6);
    const sphereMaterial = new MeshBasicMaterial({ color: 0xff0000 });

    this.model.traverse((child: any) => {
      if (child.isSkinnedMesh) {
        skinnedMeshCount++;

        // ワイヤーフレーム設定
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat: any) => {
              mat.wireframe = true;
              mat.color.setHex(0x00ff00);
            });
          } else {
            child.material.wireframe = true;
            child.material.color.setHex(0x00ff00);
          }
        }

        // ボーン間に線を描画
        if (child.skeleton) {
          const lineMaterial = new LineBasicMaterial({
            color: 0xff0000,
            linewidth: 2
          });

          child.skeleton.bones.forEach((bone: any, index: number) => {
            // 親ボーンとの間に線を描画
            if (bone.parent && bone.parent.isBone) {
              // 親ボーンから子ボーンへの線を作成
              const startPoint = new Vector3(0, 0, 0); // 親ボーンの原点
              const endPoint = bone.position.clone(); // 子ボーンのローカル位置

              const lineGeometry = new BufferGeometry().setFromPoints([
                startPoint,
                endPoint
              ]);

              const line = new Line(lineGeometry, lineMaterial);

              // depthTestを無効にして常に表示
              line.material.depthTest = false;
              line.material.transparent = true;
              line.renderOrder = 999;

              // 親ボーンに追加
              bone.parent.add(line);
              this.boneLines.push(line);
            }
          });

          totalBones += child.skeleton.bones.length;
        }
      }
    });

    console.log(`🦴 Bones: ${skinnedMeshCount} meshes, ${totalBones} bones, ${this.boneLines.length} lines`);
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

      this.visualizeBones();
      this.updateTransform();
      this.setupStateListeners();
      this.startAnimationLoop();
    } catch (error) {
      console.error("Failed to load GLB model:", error);
    }
  }

  setScene(scene: any) {
    this.scene = scene;
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

    const centerX = 0;
    const centerY = 0;
    const centerZ = 0;
    const scale = 50;

    this.model.position.set(centerX, centerY, centerZ);
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
