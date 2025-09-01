import type { Position } from "../types/particle-types";

export class TextureGenerator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true })!;
  }

  private clearCanvas(width: number, height: number): void {
    // キャンバスサイズをリセットすることで完全にクリア
    this.canvas.width = width;
    this.canvas.height = height;

    // 念のためにclearRectも実行
    this.ctx.clearRect(0, 0, width, height);

    // コンテキストの状態をリセット
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.globalAlpha = 1;
  }

  setTextWithFont(
    str: string,
    fontString: string,
    density: number,
    stageWidth: number,
    stageHeight: number
  ): Position[] {
    this.clearCanvas(stageWidth, stageHeight);

    // CSSから取得したフォント設定を適用
    this.ctx.font = fontString;
    this.ctx.fillStyle = `rgba(0,0,0,1.0)`;
    this.ctx.textBaseline = "middle";

    // テキストの描画位置を計算（画面中央に配置）
    const fontPos = this.ctx.measureText(str);

    // テキストを描画
    this.ctx.fillText(
      str,
      (stageWidth - fontPos.width) / 2, // 水平中央
      stageHeight / 2 // 垂直中央（シンプル）
    );

    // 描画されたテキストからパーティクル座標を抽出
    return this.dotPos(density, stageWidth, stageHeight);
  }

  setImage(
    path: string,
    density: number,
    stageWidth: number,
    stageHeight: number,
    callback: (positions: Position[]) => void
  ): void {
    // キャンバスを安全にクリアしてサイズを調整
    this.clearCanvas(stageWidth, stageHeight);

    const image = new Image();
    image.src = path;

    image.onload = () => {
      // 再度キャンバスをクリア（画像読み込み完了後）
      this.clearCanvas(stageWidth, stageHeight);

      // 画像のアスペクト比を計算
      const imageAspect = image.width / image.height;
      const canvasAspect = stageWidth / stageHeight;

      let drawWidth: number;
      let drawHeight: number;
      let offsetX: number;
      let offsetY: number;

      // アスペクト比を保ちながらキャンバスに収まるサイズを計算（contain方式）
      if (imageAspect > canvasAspect) {
        // 画像が横長の場合、幅に合わせる
        drawWidth = stageWidth;
        drawHeight = stageWidth / imageAspect;
        offsetX = 0;
        offsetY = (stageHeight - drawHeight) / 2;
      } else {
        // 画像が縦長の場合、高さに合わせる
        drawHeight = stageHeight;
        drawWidth = stageHeight * imageAspect;
        offsetX = (stageWidth - drawWidth) / 2;
        offsetY = 0;
      }

      // アスペクト比を保ちながら中央に配置して描画
      this.ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

      // 画像描画後に座標抽出
      const positions = this.dotPos(density, stageWidth, stageHeight);
      callback(positions);
    };

    // エラーハンドリングも追加
    image.onerror = () => {
      console.error(`Failed to load image: ${path}`);
      callback([]); // 空の配列を返してエラーを防ぐ
    };
  }

  private dotPos(
    density: number,
    stageWidth: number,
    stageHeight: number
  ): Position[] {
    // キャンバス全体のピクセルデータを取得
    const imageData = this.ctx.getImageData(0, 0, stageWidth, stageHeight).data;

    console.log(imageData);

    const particles: Position[] = [];
    let i = 0; // 行カウンター
    let width = 0; // 現在のX座標
    let pixel: number; // 現在のピクセルのアルファ値

    // Y軸方向にdensity間隔でスキャン
    for (let height = 0; height < stageHeight; height += density) {
      ++i;

      // 六角格子パターン：偶数行をオフセットして配置
      const slide = i % 2 === 0;
      width = 0;

      if (slide) {
        width += 6; // 偶数行は6ピクセル右にずらす
      }

      // X軸方向にdensity間隔でスキャン
      for (width; width < stageWidth; width += density) {
        // ピクセルのアルファ値を取得（RGBA形式の4番目の要素）
        pixel = imageData[(width + height * stageWidth) * 4 - 1];

        // アルファ値が0でない（透明でない）かつ画面内の場合、座標を追加
        if (
          pixel !== 0 &&
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

    console.log(`${particles.length}個のパーティクル座標を生成しました`);
    return particles;
  }
}
