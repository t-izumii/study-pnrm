import * as PIXI from "pixi.js";
import { Particle } from "./Particle";
import { MouseInteraction } from "../physics/MouseInteraction";
import type { MouseState } from "../types/particle-types";
import type { Position } from "../types/particle-types";
import { MOUSE_CONFIG } from "../config/particle-config";

export class ParticleSystem {
  private particles: Particle[] = [];
  private container?: PIXI.ParticleContainer;
  private positions: Position[] = [];
  private mouse: MouseState;
  private texture: any;
  private mouseInteraction = new MouseInteraction();

  constructor(texture: any) {
    this.texture = texture;
    this.mouse = {
      x: 0,
      y: 0,
      radius: MOUSE_CONFIG.radius,
    };
    this.setupEventListeners();
  }

  createParticles(positions: Position[], stage: PIXI.Container): void {
    if (this.container) {
      this.container.destroy();
      this.particles = [];
    }

    this.container = new PIXI.ParticleContainer();
    this.positions = positions;

    for (const position of positions) {
      const particle = new Particle(position, this.texture);
      this.particles.push(particle);
      this.container!.addChild(particle.sprite);
    }

    stage.addChild(this.container);
  }

  private setupEventListeners(): void {
    document.addEventListener("pointermove", this.onMove.bind(this), false);
  }

  private onMove(e: PointerEvent) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  animate() {
    this.mouseInteraction.processAllParticles(this.mouse, this.particles);
  }
}
