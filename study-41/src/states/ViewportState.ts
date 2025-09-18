import { Observable } from "./Observable";

export class ViewportState extends Observable {
  private _width: number = window.innerWidth;
  private _height: number = window.innerHeight;
  private _aspectRatio: number = window.innerWidth / window.innerHeight;
  private handleResize = () => {
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._aspectRatio = this._width / this._height;
    this.notify();
  };

  constructor() {
    super();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.handleResize);
  }

  get width() { return this._width; }
  get height() { return this._height; }
  get aspectRatio() { return this._aspectRatio; }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
    super.destroy();
  }
}