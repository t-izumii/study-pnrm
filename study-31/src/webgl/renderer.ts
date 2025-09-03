import { WebGLRenderer } from "three";

class CreateRenderer {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  init() {
    const renderer: WebGLRenderer = new WebGLRenderer({
      alpha: true,
    });
    renderer.setSize(this.width, this.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0.3);

    return renderer;
  }
}

export default CreateRenderer;
