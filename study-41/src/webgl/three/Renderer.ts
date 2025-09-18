/**
 *
 * WebGLRendererの初期化と設定
 */

import { WebGLRenderer } from "three";

export class Renderer {
  readonly renderer: WebGLRenderer;

  constructor(
    width: number = window.innerWidth,
    height: number = window.innerHeight
  ) {
    this.renderer = this.createRenderer();
    this.updateSize(width, height);
  }

  private createRenderer(): WebGLRenderer {
    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    });

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = "srgb";

    return renderer;
  }

  private updateSize(width: number, height: number): void {
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  update(width: number, height: number): void {
    this.updateSize(width, height);
  }
}