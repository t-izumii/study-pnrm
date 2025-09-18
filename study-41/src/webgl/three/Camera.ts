/**
 *
 * カメラの初期化と設定
 * - FOVを画面サイズに基づいて自動計算
 * - DOM座標系とWebGL座標系の対応
 */

import { PerspectiveCamera } from "three";

export class Camera {
  width: number;
  height: number;
  camera: PerspectiveCamera;

  constructor(
    width: number = window.innerWidth,
    height: number = window.innerHeight
  ) {
    this.width = width;
    this.height = height;
    this.camera = this.setup();
  }

  private setup() {
    const distance = 1000;
    const aspect = this.width / this.height;
    const fov = 2 * Math.atan(this.height / 2 / distance) * (180 / Math.PI);

    this.camera = new PerspectiveCamera(fov, aspect, 0.1, distance * 2);
    this.camera.position.z = distance;

    return this.camera;
  }

  update(width: number, height: number): void {
    const distance = this.camera.position.z;
    const fov = 2 * Math.atan(height / 2 / distance) * (180 / Math.PI);
    this.camera.aspect = width / height;
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  get() {
    return this.camera;
  }
}