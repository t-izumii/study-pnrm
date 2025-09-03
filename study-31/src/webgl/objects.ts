import { PlaneGeometry, Mesh, ShaderMaterial, TextureLoader } from "three";
import GUI from "lil-gui";
import fragment from "./glsl/fragment.glsl";
import vertex from "./glsl/vertex.glsl";

class CreateObject {
  html: Element;
  width: number;
  height: number;
  mesh: Mesh | null = null;
  geometry: PlaneGeometry | null = null;
  material: ShaderMaterial | null = null;

  constructor(html: Element, width: number, height: number) {
    this.html = html;
    this.width = width;
    this.height = height;
  }

  init() {
    const rect = this.html.getBoundingClientRect();
    this.geometry = new PlaneGeometry(rect.width, rect.height, 50, 50);
    
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load('/src/textures/texture.png');
    
    this.material = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTime: { value: 0.0 },
        uResolution: { value: [this.width, this.height] },
        uProgress: { value: 1.0 },
        uTexture: { value: texture },
      },
      transparent: true,
    });

    this.mesh = new Mesh(this.geometry, this.material);

    const x = -this.width / 2 + rect.width / 2 + rect.x;
    const y = this.height / 2 - rect.height / 2 - rect.y;

    this.mesh.position.set(x, y, 0);

    return this.mesh;
  }

  update(width: number, height: number, time: number) {
    const rect = this.html.getBoundingClientRect();
    const newGeometry = new PlaneGeometry(rect.width, rect.height, 50, 50);

    this.mesh.geometry.dispose();
    this.mesh.geometry = newGeometry;

    const x = -width / 2 + rect.width / 2 + rect.x;
    const y = height / 2 - rect.height / 2 - rect.y;

    this.mesh.position.set(x, y, 0);

    if (this.material) {
      this.material.uniforms.uTime.value = time;
    }
  }
}

export default CreateObject;
