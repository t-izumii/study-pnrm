export class EventManager {
  private resizeCallbacks: (() => void)[] = [];

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.handleResize.bind(this), false);
  }

  private handleResize(): void {
    this.resizeCallbacks.forEach(callback => callback());
  }

  addResizeListener(callback: () => void): void {
    this.resizeCallbacks.push(callback);
  }

  removeResizeListener(callback: () => void): void {
    const index = this.resizeCallbacks.indexOf(callback);
    if (index > -1) {
      this.resizeCallbacks.splice(index, 1);
    }
  }

  destroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this), false);
    this.resizeCallbacks = [];
  }
}
