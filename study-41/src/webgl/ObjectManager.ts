import { WebGLObject } from "./object/WebGLObject";
import { Scene, WebGLRenderer } from "three";
import * as THREE from "three";
import { globalState } from "../states";
import { Light, LightPresets, type LightConfig } from "./three/Light";

interface WebGLObjectConstructor {
  new (el: HTMLElement): WebGLObject;
}

interface WebGLObjectModule {
  default: WebGLObjectConstructor;
}

type WebGLObjectType = string;

interface ObjectManagerConfig {
  enableLights?: boolean;
  lightConfig?: LightConfig;
  lightPreset?: keyof typeof LightPresets;
  enableLightHelpers?: boolean;
}

export class ObjectManager {
  objects: WebGLObject[] = [];
  scene: Scene;
  renderer: WebGLRenderer;
  lights?: Light;
  lightHelpers: THREE.Object3D[] = [];
  config: ObjectManagerConfig;

  constructor(scene: Scene, renderer: WebGLRenderer, config: ObjectManagerConfig = {}) {
    this.scene = scene;
    this.renderer = renderer;
    this.config = {
      enableLights: true,
      lightPreset: 'natural',
      enableLightHelpers: false,
      ...config
    };
    
    this.setupResize();
    this.setupLights();
  }

  private setupLights(): void {
    if (!this.config.enableLights) return;

    let lightConfig: LightConfig;

    if (this.config.lightConfig) {
      lightConfig = this.config.lightConfig;
    } else if (this.config.lightPreset) {
      lightConfig = LightPresets[this.config.lightPreset];
    } else {
      lightConfig = LightPresets.natural;
    }

    this.lights = new Light(lightConfig);
    this.lights.addToScene(this.scene);

    // ライトヘルパーの設定
    if (this.config.enableLightHelpers) {
      this.lightHelpers = this.lights.createHelpers();
      this.lightHelpers.forEach(helper => {
        this.scene.add(helper);
      });
    }

    // レンダラーの影設定を有効にする
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private setupObjectShadows(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  // ライトの設定を動的に変更
  updateLightConfig(newConfig: Partial<LightConfig>): void {
    if (!this.lights) return;
    
    this.lights.updateConfig({ ...this.lights.getLights(), ...newConfig });
    
    // 既存のライトをシーンから削除
    this.lights.removeFromScene(this.scene);
    
    // 新しい設定でライトを再追加
    this.lights.addToScene(this.scene);
  }

  // ライトプリセットを変更
  setLightPreset(preset: keyof typeof LightPresets): void {
    if (!this.lights) return;
    
    this.lights.removeFromScene(this.scene);
    this.lights = new Light(LightPresets[preset]);
    this.lights.addToScene(this.scene);
    
    this.config.lightPreset = preset;
  }

  // ライトの強度を変更
  setLightIntensity(lightType: keyof LightConfig, intensity: number): void {
    if (!this.lights) return;
    this.lights.setIntensity(lightType, intensity);
  }

  // ライトの色を変更
  setLightColor(lightType: keyof LightConfig, color: number | string): void {
    if (!this.lights) return;
    this.lights.setColor(lightType, color);
  }

  // ライトヘルパーの表示/非表示を切り替え
  toggleLightHelpers(show: boolean): void {
    if (!this.lights) return;
    
    // 既存のヘルパーを削除
    this.lightHelpers.forEach(helper => {
      this.scene.remove(helper);
    });
    this.lightHelpers = [];
    
    if (show) {
      this.lightHelpers = this.lights.createHelpers();
      this.lightHelpers.forEach(helper => {
        this.scene.add(helper);
      });
    }
    
    this.config.enableLightHelpers = show;
  }

  // ライトオブジェクトを取得
  getLights(): Light | undefined {
    return this.lights;
  }

  async init() {
    const els = document.querySelectorAll("[data-webgl]");
    const promises = [...els].map(async (el) => {
      try {
        const type = (el as HTMLElement).dataset.webgl as WebGLObjectType;

        if (!type) {
          console.warn("data-webgl attribute is missing or empty", el);
          return;
        }

        const module = await this.loadWebGLObject(type);
        if (!module) return;

        const obj = new module.default(el as HTMLElement);
        
        // モデルオブジェクトの場合はレンダラーを設定
        if (type === 'model' && 'setRenderer' in obj) {
          (obj as any).setRenderer(this.renderer);
        }
        
        await obj.init();
        this.objects.push(obj);
        this.scene.add(obj.mesh);
        
        // ライトが有効で影を受ける設定にする
        if (this.lights && obj.mesh) {
          this.setupObjectShadows(obj.mesh);
        }
      } catch (error) {
        console.error(`Failed to create WebGL object for element:`, el, error);
      }
    });

    await Promise.all(promises);
  }

  private async loadWebGLObject(
    type: WebGLObjectType
  ): Promise<WebGLObjectModule | null> {
    try {
      const module = (await import(
        `./object/glsl/${type}/index.ts`
      )) as WebGLObjectModule;

      if (!module.default || typeof module.default !== "function") {
        console.error(`Invalid module export for type: ${type}`);
        return null;
      }

      return module;
    } catch (error) {
      console.error(
        `Failed to load WebGL object module for type: ${type}`,
        error
      );
      return null;
    }
  }


  setupResize() {
    globalState.viewport.subscribe(() => {
      this.objects.forEach((obj) => {
        obj.updateGeometry();
        obj.updatePosition();
      });
    });
  }

  destroy() {
    this.objects.forEach((obj) => {
      obj.destroy();
      this.scene.remove(obj.mesh);
    });
    this.objects = [];
    
    // ライトのクリーンアップ
    if (this.lights) {
      this.lights.removeFromScene(this.scene);
      this.lights.dispose();
    }
    
    // ライトヘルパーの削除
    this.lightHelpers.forEach(helper => {
      this.scene.remove(helper);
    });
    this.lightHelpers = [];
  }
}
