import { Observable } from "./Observable";

export class MouseState extends Observable {
  private _x: number = 0;
  private _y: number = 0;
  private _normalizedX: number = 0.5;
  private _normalizedY: number = 0.5;
  private _isPressed: boolean = false;
  
  private handleMouseMove = (event: MouseEvent) => {
    this._x = event.clientX;
    this._y = event.clientY;
    this._normalizedX = event.clientX / window.innerWidth;
    this._normalizedY = 1 - event.clientY / window.innerHeight;
    this.notify();
  };

  private handleMouseDown = () => {
    this._isPressed = true;
    this.notify();
  };

  private handleMouseUp = () => {
    this._isPressed = false;
    this.notify();
  };

  constructor() {
    super();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  get x() { return this._x; }
  get y() { return this._y; }
  get normalizedX() { return this._normalizedX; }
  get normalizedY() { return this._normalizedY; }
  get isPressed() { return this._isPressed; }

  destroy() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    super.destroy();
  }
}