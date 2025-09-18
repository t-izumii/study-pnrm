import { WebGLObject } from "../../WebGLObject";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

export default class extends WebGLObject {
  setupUniforms() {
    const uniforms = super.setupUniforms();
    return uniforms;
  }
  setupVertex() {
    return vertexShader;
  }
  setupFragment() {
    return fragmentShader;
  }
}
