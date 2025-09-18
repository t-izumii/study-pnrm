/**
 *
 * Three.jsシーンの初期化
 */

import { Scene as ThreeScene } from "three";

export class Scene {
  scene: ThreeScene;
  constructor() {
    this.scene = this.setup();
  }

  private setup() {
    this.scene = new ThreeScene();

    return this.scene;
  }

  update() {}

  get() {
    return this.scene;
  }
}