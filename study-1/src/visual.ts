import * as PIXI from "pixi.js";
import { Text } from "./text";
import { Particle } from "./particle";
import { TEXT_CONFIG, MOUSE_CONFIG } from "./config";

// Local type definitions to avoid import issues
interface Position {
  x: number;
  y: number;
}

interface MouseState {
  x: number;
  y: number;
  radius: number;
}

export class Visual {
  private text: Text;
  private texture: PIXI.Texture;
  private particles: Particle[] = [];
  private container?: PIXI.ParticleContainer;
  private pos: Position[] = [];
  private mouse: MouseState;

  constructor() {
    this.text = new Text();
    this.texture = PIXI.Texture.from('/particle.png');

    this.mouse = {
      x: 0,
      y: 0,
      radius: MOUSE_CONFIG.radius,
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener('pointermove', this.onMove.bind(this), false);
  }

  show(stageWidth: number, stageHeight: number, stage: PIXI.Container): void {
    if (this.container) {
      stage.removeChild(this.container);
    }

    this.pos = this.text.setText(TEXT_CONFIG.defaultText, TEXT_CONFIG.density, stageWidth, stageHeight);
    this.container = new PIXI.ParticleContainer(
      this.pos.length,
      {
        vertices: false,
        position: true,
        rotation: false,
        scale: false,
        uvs: false,
        tint: false,
      }
    );

    stage.addChild(this.container);

    this.particles = [];
    for (let i = 0; i < this.pos.length; i++) {
      const item = new Particle(this.pos[i], this.texture);
      this.container.addChild(item.sprite);
      this.particles.push(item);
    }
  }

  animate(): void {
    for (let i = 0; i < this.particles.length; i++) {
      const item = this.particles[i];
      const dx = this.mouse.x - item.x;
      const dy = this.mouse.y - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = item.radius + this.mouse.radius;

      if (dist < minDist) {
        const angle = Math.atan2(dy, dx);
        const tx = item.x + Math.cos(angle) * minDist;
        const ty = item.y + Math.sin(angle) * minDist; // Math.sign -> Math.sin に修正
        const ax = tx - this.mouse.x;
        const ay = ty - this.mouse.y;

        item.vx -= ax;
        item.vy -= ay;
      }

      item.draw();
    }
  }

  private onMove(e: PointerEvent): void {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  destroy(): void {
    document.removeEventListener('pointermove', this.onMove.bind(this), false);
  }
}
