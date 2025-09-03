import { PerspectiveCamera } from "three";

class CreateCamera {
  distance: number;
  fov: number;
  aspect: number;
  near: number;
  far: number;

  constructor(width: number, height: number) {
    this.distance = 100;
    this.fov = 2 * Math.atan(height / 2 / this.distance) * (180 / Math.PI);
    this.aspect = width / height;
    this.near = 0.1;
    this.far = 1000;
  }

  init() {
    const camera: PerspectiveCamera = new PerspectiveCamera(
      this.fov,
      this.aspect,
      this.near,
      this.far
    );
    camera.position.z = this.distance;

    return camera;
  }
}

export default CreateCamera;
