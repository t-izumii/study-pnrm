import { WebGLObject } from "./object/WebGLObject";
import { Scene, WebGLRenderer } from "three";
import { globalState } from "../states";

interface WebGLObjectConstructor {
  new (el: HTMLElement): WebGLObject;
}

interface WebGLObjectModule {
  default: WebGLObjectConstructor;
}

type WebGLObjectType = string;

export class ObjectManager {
  objects: WebGLObject[] = [];
  scene: Scene;
  renderer: WebGLRenderer;

  constructor(scene: Scene, renderer: WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.setupResize();
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
  }
}
