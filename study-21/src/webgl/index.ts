import * as THREE from "three";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import flowmapVertexShader from "./vertex.glsl";
import flowmapFragmentShader from "./fragment.glsl";

import { lerp } from "./utility";

export class WebGLApp {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private clock: THREE.Clock;
  private mouse: THREE.Vector2;
  private currentMouse: THREE.Vector2;
  private velocity: THREE.Vector2;
  private flowmapRenderTarget1: THREE.WebGLRenderTarget;
  private flowmapRenderTarget2: THREE.WebGLRenderTarget;
  private flowmapScene: THREE.Scene;
  private flowmapCamera: THREE.OrthographicCamera;
  private flowmapMaterial: THREE.ShaderMaterial;

  constructor(canvas?: HTMLCanvasElement) {
    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2(0.5, 0.5);
    this.currentMouse = new THREE.Vector2(0.5, 0.5);
    this.velocity = new THREE.Vector2(0.5, 0.5);

    try {
      this.init(canvas);
      console.log("WebGL初期化完了");
    } catch (error) {
      console.error("WebGL初期化エラー:", error);
    }
  }

  private init(canvas?: HTMLCanvasElement): void {
    this.createRenderer(canvas);
    this.createScene();
    this.createCamera();
    this.createMaterial();
    this.createMesh();
    this.createFlowmapSystem();
    this.setupEvents();
    this.animate();
  }

  private createRenderer(canvas?: HTMLCanvasElement): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas || undefined,
      alpha: true,
      antialias: false, // アンチエイリアスを無効化
      premultipliedAlpha: false, // アルファの乗算前処理を無効化
      preserveDrawingBuffer: false, // パフォーマンスのため無効化
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; // 色空間を設定

    if (!canvas) {
      this.renderer.domElement.className = "g_canvas_distortion";
      this.renderer.domElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 3;
        pointer-events: none;
      `;
      document.body.appendChild(this.renderer.domElement);
    }
  }

  private createScene(): void {
    this.scene = new THREE.Scene();
  }

  private createCamera(): void {
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  private createMaterial(): void {
    const texture = this.loadTexture("src/image.png");

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uMouse: { value: this.mouse },
        uVelocity: { value: this.velocity },
        uTime: { value: 0 },
        uDistortion: { value: 0.1 },
        uTextureSize: { value: new THREE.Vector2(1, 1) }, // テクスチャサイズ（loadTextureで更新）
        uPlaneSize: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        }, // 表示領域サイズ
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false, // 深度バッファへの書き込みを無効化
      depthTest: false, // 深度テストを無効化
      blending: THREE.NormalBlending, // 通常のブレンディング
      alphaTest: 0.01, // アルファテストの闾値
    });
  }

  private createFlowmapSystem(): void {
    // 1. RenderTargetを作成
    const width = 512;
    const height = 512;

    this.flowmapRenderTarget1 = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });

    this.flowmapRenderTarget2 = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });

    // 2. Sceneを作成
    this.flowmapScene = new THREE.Scene();

    // 3. Cameraを作成
    this.flowmapCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // 4. Materialを作成
    this.flowmapMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPreviousFlow: { value: null },
        uMouse: { value: this.mouse },
        uVelocity: { value: this.velocity },
        uTime: { value: 0 },
        uDecay: { value: 0.96 },
        uInfluenceRadius: { value: 0.15 },
        uStrength: { value: 1.5 },
      },
      vertexShader: flowmapVertexShader, // 別途作成が必要
      fragmentShader: flowmapFragmentShader, // 別途作成が必要
    });

    // 5. Meshを作成
    const geometry = new THREE.PlaneGeometry(2, 2);
    const flowmapMesh = new THREE.Mesh(geometry, this.flowmapMaterial);
    this.flowmapScene.add(flowmapMesh);
  }

  private createMesh(): void {
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);
  }

  private setupEvents(): void {
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX / window.innerWidth;
      this.mouse.y = 1.0 - e.clientY / window.innerHeight;
    });

    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      // リサイズ時に表示領域のサイズを更新
      if (this.material && this.material.uniforms.uPlaneSize) {
        this.material.uniforms.uPlaneSize.value.set(
          window.innerWidth,
          window.innerHeight
        );
      }
    });

    console.log("イベントリスナー設定完了");
  }

  public loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(
        url,
        (texture) => {
          // NearestFilterでピクセルパーフェクトな表示
          texture.minFilter = THREE.NearestFilter;
          texture.magFilter = THREE.NearestFilter;
          texture.generateMipmaps = false;

          // ラッピング設定
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;

          // 色空間の設定
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.needsUpdate = true;

          this.material.uniforms.uTexture.value = texture;
          // テクスチャの実際のサイズを取得して uniform に設定
          const image = texture.image as HTMLImageElement;
          if (image && image.width && image.height) {
            this.material.uniforms.uTextureSize.value.set(
              image.width,
              image.height
            );
          }
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  public setDistortion(value: number): void {
    this.material.uniforms.uDistortion.value = value;
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    // 前フレームの位置を保存
    const previousMouseX = this.currentMouse.x;
    const previousMouseY = this.currentMouse.y;

    // 現在のマウス位置を更新（mouseはイベントハンドラで更新される）
    this.currentMouse.x = this.mouse.x;
    this.currentMouse.y = this.mouse.y;

    // 即時の生のベロシティを計算
    const rawVelocityX = this.currentMouse.x - previousMouseX;
    const rawVelocityY = this.currentMouse.y - previousMouseY;

    // lerpでスムージング
    this.velocity.x = lerp(this.velocity.x, rawVelocityX, 0.1);
    this.velocity.y = lerp(this.velocity.y, rawVelocityY, 0.1);

    this.material.uniforms.uTime.value = this.clock.getElapsedTime();
    this.material.uniforms.uVelocity.value = this.velocity;

    this.renderer.render(this.scene, this.camera);
  };

  public dispose(): void {
    this.renderer.dispose();
    this.material.dispose();
    this.mesh.geometry.dispose();
  }
}

export default WebGLApp;
