import * as PIXI from 'pixi.js';
import {Text} from './text';
import { Particle } from './particle';

export class Visual {
  text: Text
  texture: any
  particles: any[]
  mouse: { x: number; y: number; radius: number }
  container: any
  pos: any[]

  constructor() {
    this.text = new Text();
    this.createTexture();

    this.particles = [];
    this.mouse = {
      x: 0,
      y: 0,
      radius: 30,
    }

    document.addEventListener('pointermove', this.onMove.bind(this), false);
  }

  createTexture() {
    // Create a simple black circle texture
    const graphics = new PIXI.Graphics();
    graphics.circle(5, 5, 3);
    graphics.fill(0x000000);
    
    this.texture = graphics;
    console.log('Texture created:', this.texture);
  }

  show(stageWidth: number, stageHeight: number, stage: PIXI.Container) {
    if(this.container) {
      stage.removeChild(this.container);
    }

    this.pos = this.text.setText('PNRM', 2, stageWidth, stageHeight);
    console.log('Particle positions:', this.pos.length);
    this.container = new PIXI.Container();

    stage.addChild(this.container);

    this.particles = [];
    for(let i = 0; i < this.pos.length; i++) {
      const item = new Particle(this.pos[i], this.texture);
      this.container.addChild(item.sprite);
      this.particles.push(item);
    }
    console.log('Created particles:', this.particles.length);
  }

  animate() {
    for (let i = 0 ; i < this.particles.length; i++ ) {
      const item = this.particles[i];
      const dx = this.mouse.x - item.x;
      const dy = this.mouse.y - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = item.radius + this.mouse.radius;

      if ( dist < minDist) {
        const angle = Math.atan2(dy,dx);
        const tx = item.x + Math.cos(angle) * minDist;
        const ty = item.y + Math.sign(angle) * minDist;
        const ax = tx - this.mouse.x;
        const ay = ty - this.mouse.y;
        item.vx -= ax;
        item.vy -= ay;
      }

      item.draw();
    }
  }

  onMove(e: PointerEvent) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }
}