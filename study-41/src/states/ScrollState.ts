import { Observable } from "./Observable";

export class ScrollState extends Observable {
  private _x: number = 0;
  private _y: number = 0;
  private _normalizedX: number = 0;
  private _normalizedY: number = 0;
  
  private handleScroll = () => {
    this.updateValues();
    this.notify();
  };

  constructor() {
    super();
    this.setupEventListeners();
    this.updateValues();
  }

  private setupEventListeners() {
    window.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  private updateValues() {
    this._x = window.scrollX;
    this._y = window.scrollY;
    
    const maxScrollX = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
    const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    
    this._normalizedX = maxScrollX > 0 ? this._x / maxScrollX : 0;
    this._normalizedY = maxScrollY > 0 ? this._y / maxScrollY : 0;
  }

  get x() { return this._x; }
  get y() { return this._y; }
  get normalizedX() { return this._normalizedX; }
  get normalizedY() { return this._normalizedY; }

  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
    super.destroy();
  }
}