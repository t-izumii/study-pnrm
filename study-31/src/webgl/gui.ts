import { GUI } from "lil-gui";

class CreateGUI {
  gui: GUI;

  constructor() {
    this.gui = new GUI();
  }

  init() {
    return this.gui;
  }

  addFolder(name: string) {
    return this.gui.addFolder(name);
  }

  addControl(
    object: any,
    property: string,
    min?: number,
    max?: number,
    step?: number
  ) {
    return this.gui.add(object, property, min, max, step);
  }

  addColorControl(object: any, property: string) {
    return this.gui.addColor(object, property);
  }

  destroy() {
    this.gui.destroy();
  }
}

export default CreateGUI;
