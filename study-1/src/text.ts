export class Text {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '-1';
    
    this.ctx = this.canvas.getContext('2d')!;
  }

  setText(str: string, density: number, stageWidth: number, stageHeight: number) {
    if (!this.ctx) {
      console.error('Canvas context not available');
      return [];
    }
    
    this.canvas.width = stageWidth;
    this.canvas.height = stageHeight;

    const myText = str;
    const fontWidth = 700;
    const fontSize = 200;
    const fontName = 'Hind';

    this.ctx.clearRect(0, 0, stageWidth, stageHeight);
    this.ctx.font = `${fontWidth} ${fontSize}px ${fontName}`;
    this.ctx.fillStyle = `rgba(0,0,0,0.1)`;
    this.ctx.textBaseline = 'middle';
    const fontPos = this.ctx.measureText(myText);

    this.ctx.fillText(
      myText,
      stageWidth / 2 - fontPos.width / 2,
      fontPos.actualBoundingBoxAscent + fontPos.actualBoundingBoxDescent + (stageHeight - fontSize) / 2
    );

    const particles = this._dotPos(density, stageWidth, stageHeight);
    console.log('Generated particles:', particles.length);
    return particles;
  }

  _dotPos(density: number, stageWidth: number, stageHeight: number) {
    const imageData = this.ctx.getImageData(
      0,0,stageWidth, stageHeight
    ).data;

    const particles = [];
    let i = 0;
    let width = 0;
    let pixel;

    for (let height = 0; height < stageHeight; height += density) {
      ++i;

      const slide = i % 2 === 0;
      width = 0;

      if (slide) {
        width += 6;
      }

      for (let width = 0; width < stageWidth; width += density) {
        pixel = imageData[((width + (height * stageWidth)) * 4 ) + 3];

        if (pixel != 0 && 
            width > 0 &&
            width < stageWidth &&
            height > 0 &&
            height < stageHeight ) {
          particles.push({
            x:width,
            y:height,
          })
        }
      }
    }

    return particles;
  }
}