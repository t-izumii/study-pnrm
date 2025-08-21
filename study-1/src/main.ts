
import * as PIXI from "pixi.js";
import {Text} from './text'
import {Visual} from './visual'
import './style.css'

class App {
  renderer: PIXI.Application
  stage: PIXI.Container
  stageWidth: number
  stageHeight: number
  text: Text
  visual: Visual

  constructor() {
    this.#_init();
  }

  async #_init() {
    await this.#_setWebgl();
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

    // this.text = new Text();
    // this.text.setText(
    //   'PNRM',
    //   2,
    //   document.body.clientWidth,
    //   document.body.clientHeight
    //   )

    this.visual = new Visual();

    window.addEventListener('resize' , this.resize.bind(this), false);
    this.resize();

    requestAnimationFrame(this.animate.bind(this));
  }

  async #_setWebgl() {
    this.renderer = new PIXI.Application();
    await this.renderer.init({
      width: document.body.clientWidth,
      height: document.body.clientHeight,
      antialias: true,
      backgroundAlpha: 0,
      resolution: (window.devicePixelRatio > 1) ? 2: 1,
      autoDensity: true,
    });

    document.body.appendChild(this.renderer.canvas);
    this.stage = this.renderer.stage;

    const blurFilter = new PIXI.BlurFilter();
    blurFilter.blur = 10;

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

    const thresholdFilter = new PIXI.Filter(null, fragSource, uniformData);
    this.stage.filters = [blurFilter, thresholdFilter];
    this.stage.filterArea = this.renderer.screen;
  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.renderer.resize();
    this.visual.show(this.stageWidth, this.stageHeight, this.stage);
  }

  animate(t: number) {
    requestAnimationFrame(this.animate.bind(this));
    this.visual.animate();
    this.renderer.render();
  }
}

window.onload = () => {
  new App();
}