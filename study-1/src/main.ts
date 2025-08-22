import { Visual } from './visual';
import { RendererManager } from './managers/renderer-manager';
import { EventManager } from './managers/event-manager';
import { FontLoader } from './utils/font-loader';
import './style.css';

class App {
  private rendererManager: RendererManager;
  private eventManager: EventManager;
  private visual: Visual;
  private stageWidth: number = 0;
  private stageHeight: number = 0;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await FontLoader.loadFont();
    
    this.rendererManager = new RendererManager();
    this.eventManager = new EventManager();
    this.visual = new Visual();

    this.setupEventListeners();
    this.resize();
    this.startAnimationLoop();
  }

  private setupEventListeners(): void {
    this.eventManager.addResizeListener(this.resize.bind(this));
  }

  private resize(): void {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.rendererManager.resize(this.stageWidth, this.stageHeight);
    this.visual.show(this.stageWidth, this.stageHeight, this.rendererManager.getStage());
  }

  private startAnimationLoop(): void {
    const animate = (): void => {
      requestAnimationFrame(animate);
      this.visual.animate();
      this.rendererManager.render();
    };
    animate();
  }

  // アプリケーション終了時のクリーンアップ
  destroy(): void {
    this.eventManager.destroy();
    this.visual.destroy();
  }
}

window.onload = () => {
  new App();
};
