
import * as PIXI from "pixi.js";
import {Text} from './text'
import {Visual} from './visual'
import './style.css'

class App {
  renderer: PIXI.Renderer;
  stage: PIXI.Container;
  visual: Visual;
  stageWidth: number;
  stageHeight: number;

  constructor() {
    this.#_fontLoad();
  }

  async #_fontLoad() {
    const exampleFontFamilyName = "Noto Sans JP";
    const urlFamilyName = exampleFontFamilyName.replace(/ /g, "+");
    const googleApiUrl = `https://fonts.googleapis.com/css?family=${urlFamilyName}`;

    const response = await fetch(googleApiUrl);
    if (response.ok) {
      const css = await response.text();
      const matchUrls = css.match(/url\(.+?\)/g);
      if (!matchUrls) throw new Error("フォントが見つかりませんでした");

      const url = matchUrls[0]
      const font = new FontFace(exampleFontFamilyName, url);
      await font.load();
      document.fonts.add(font);
    }

    this.stage = new PIXI.Container();
    this.visual = new Visual();
    this.setWebgl();
    
    window.addEventListener('resize', this.resize.bind(this), false);
    this.resize();

    requestAnimationFrame(this.animate.bind(this));
  }

  setWebgl() {
    this.renderer = new PIXI.Renderer({
      width: document.body.clientWidth,
      height: document.body.clientHeight,
      antialias: false,
      resolution: (window.devicePixelRatio > 1) ? 2: 1,
      autoDensity: true,
      powerPreference: "high-performance",
      backgroundColor: 0xffffff,
    })
    document.body.appendChild(this.renderer.view as any);

    const blurFilter = new PIXI.filters.BlurFilter();
    blurFilter.blur = 1;
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
      threshold: 0.5,
      mr: 0.0 / 255.0,
      mg: 0.0 / 255.0,
      mb: 0.0 / 255.0,
    };

    const thresholdFilter = new PIXI.Filter(undefined, fragSource, uniformData);
    this.stage.filters = [blurFilter, thresholdFilter];
    this.stage.filterArea = this.renderer.screen;

  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.renderer.resize(this.stageWidth, this.stageHeight);
    
    this.visual.show(this.stageWidth, this.stageHeight, this.stage);
  }

  animate(t: number) {
    requestAnimationFrame(this.animate.bind(this));

    this.visual.animate();

    this.renderer.render(this.stage);

  }
}

window.onload = () => {
  new App();
}
