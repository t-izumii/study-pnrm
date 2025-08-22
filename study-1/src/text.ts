import { TEXT_CONFIG } from "./config";

// Local type definition to avoid import issues
interface Position {
  x: number;
  y: number;
}

export class Text {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  setText(str: string, density: number, stageWidth: number, stageHeight: number): Position[] {
    this.canvas.width = stageWidth;
    this.canvas.height = stageHeight;

    this.ctx.clearRect(0, 0, stageWidth, stageHeight);
    this.ctx.font = `${TEXT_CONFIG.fontSize}px ${TEXT_CONFIG.fontName}`;
    this.ctx.fillStyle = `rgba(0,0,0,1.0)`;
    this.ctx.textBaseline = 'middle';

    const fontPos = this.ctx.measureText(str);

    this.ctx.fillText(
      str,
      (stageWidth - fontPos.width) / 2,
      fontPos.actualBoundingBoxAscent + fontPos.actualBoundingBoxDescent + ((stageHeight - TEXT_CONFIG.fontSize) / 2)
    );

    return this.dotPos(density, stageWidth, stageHeight);
  }

  private dotPos(density: number, stageWidth: number, stageHeight: number): Position[] {
    const imageData = this.ctx.getImageData(
      0, 0, stageWidth, stageHeight
    ).data;

    const particles: Position[] = [];
    let i = 0;
    let width = 0;
    let pixel: number;

    for (let height = 0; height < stageHeight; height += density) {
      ++i;

      const slide = (i % 2) === 0;
      width = 0;

      if (slide) {
        width += 6;
      }

      for (width; width < stageWidth; width += density) {
        pixel = imageData[((width + (height * stageWidth)) * 4) - 1];
        if (pixel !== 0 &&
          width > 0 &&
          width < stageWidth &&
          height > 0 &&
          height < stageHeight
        ) {
          particles.push({
            x: width,
            y: height,
          });
        }
      }
    }

    return particles;
  }
}
