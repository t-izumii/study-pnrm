import * as PIXI from "pixi.js";
import { RENDERER_CONFIG, FILTER_CONFIG } from '../config';

export class RendererManager {
  private renderer: PIXI.Renderer;
  private stage: PIXI.Container;

  constructor() {
    this.stage = new PIXI.Container();
    this.setupRenderer();
    this.setupFilters();
  }

  private setupRenderer(): void {
    this.renderer = new PIXI.Renderer({
      width: document.body.clientWidth,
      height: document.body.clientHeight,
      ...RENDERER_CONFIG,
    });
    
    document.body.appendChild(this.renderer.view as any);
  }

  private setupFilters(): void {
    const blurFilter = new PIXI.filters.BlurFilter();
    blurFilter.blur = FILTER_CONFIG.blur;
    blurFilter.autoFit = true;

    const fragSource = `
    precision mediump float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform float threshold;
    uniform float mr;
    uniform float mg;
    uniform float mb;
    void main(void) {
      vec4 color = texture2D(uSampler, vTextureCoord);
      vec3 mcolor = vec3(mr, mg, mb);
      if (color.a > threshold) {
        gl_FragColor = vec4(mcolor, 1.0);
      } else {
        gl_FragColor = vec4(vec3(0.0), 0.0);
      }
    }
    `;

    const uniformData = {
      threshold: FILTER_CONFIG.threshold,
      mr: FILTER_CONFIG.mr,
      mg: FILTER_CONFIG.mg,
      mb: FILTER_CONFIG.mb,
    };

    const thresholdFilter = new PIXI.Filter(undefined, fragSource, uniformData);
    this.stage.filters = [blurFilter, thresholdFilter];
    this.stage.filterArea = this.renderer.screen;
  }

  resize(width: number, height: number): void {
    this.renderer.resize(width, height);
  }

  render(): void {
    this.renderer.render(this.stage);
  }

  getStage(): PIXI.Container {
    return this.stage;
  }

  getRenderer(): PIXI.Renderer {
    return this.renderer;
  }
}
