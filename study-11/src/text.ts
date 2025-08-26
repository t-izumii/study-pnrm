/**
 * テキストをパーティクル配置用の座標データに変換するクラス
 * 
 * 主な機能：
 * - Canvas 2D APIを使用したテキストレンダリング
 * - ピクセルデータの解析によるパーティクル座標の抽出
 * - 六角格子パターンでの座標配置（美的効果のため）
 */

import { TEXT_CONFIG } from "./config";

// ローカル型定義（インポート問題を回避）
interface Position {
  x: number;
  y: number;
}

export class Text {
  // オフスクリーンキャンバス（実際の画面には表示されない）
  private canvas: HTMLCanvasElement;
  // 2Dレンダリングコンテキスト
  private ctx: CanvasRenderingContext2D;

  constructor() {
    // HTMLCanvasElementを動的に作成
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * テキストを描画してパーティクル座標配列を生成
   * 
   * @param str - 描画するテキスト文字列
   * @param density - パーティクルの密度（ピクセル間隔）
   * @param stageWidth - ステージの幅
   * @param stageHeight - ステージの高さ
   * @returns パーティクルを配置する座標の配列
   */
  setText(str: string, density: number, stageWidth: number, stageHeight: number): Position[] {
    // キャンバスサイズをステージサイズに合わせる
    this.canvas.width = stageWidth;
    this.canvas.height = stageHeight;

    // キャンバスをクリアして新しいテキストを描画
    this.ctx.clearRect(0, 0, stageWidth, stageHeight);
    
    // フォントとスタイルを設定
    this.ctx.font = `${TEXT_CONFIG.fontSize}px ${TEXT_CONFIG.fontName}`;
    this.ctx.fillStyle = `rgba(0,0,0,1.0)`; // 黒色で描画
    this.ctx.textBaseline = 'middle';        // 中央揃え

    // テキストの描画位置を計算（画面中央に配置）
    const fontPos = this.ctx.measureText(str);

    // テキストを描画
    this.ctx.fillText(
      str,
      (stageWidth - fontPos.width) / 2,  // 水平中央
      fontPos.actualBoundingBoxAscent + fontPos.actualBoundingBoxDescent + ((stageHeight - TEXT_CONFIG.fontSize) / 2) // 垂直中央
    );

    // 描画されたテキストからパーティクル座標を抽出
    return this.dotPos(density, stageWidth, stageHeight);
  }

  /**
   * キャンバスのピクセルデータを解析してパーティクル座標を抽出
   * 
   * アルゴリズム：
   * 1. 指定された密度間隔でピクセルをサンプリング
   * 2. 六角格子パターンで配置（偶数行をオフセット）
   * 3. アルファ値が0でないピクセルの座標を収集
   * 
   * @param density - サンプリング間隔
   * @param stageWidth - キャンバス幅
   * @param stageHeight - キャンバス高さ
   * @returns パーティクル配置座標の配列
   */
  private dotPos(density: number, stageWidth: number, stageHeight: number): Position[] {
    // キャンバス全体のピクセルデータを取得
    const imageData = this.ctx.getImageData(
      0, 0, stageWidth, stageHeight
    ).data;

    const particles: Position[] = [];
    let i = 0;      // 行カウンター
    let width = 0;  // 現在のX座標
    let pixel: number; // 現在のピクセルのアルファ値

    // Y軸方向にdensity間隔でスキャン
    for (let height = 0; height < stageHeight; height += density) {
      ++i;

      // 六角格子パターン：偶数行をオフセットして配置
      const slide = (i % 2) === 0;
      width = 0;

      if (slide) {
        width += 6; // 偶数行は6ピクセル右にずらす
      }

      // X軸方向にdensity間隔でスキャン
      for (width; width < stageWidth; width += density) {
        // ピクセルのアルファ値を取得（RGBA形式の4番目の要素）
        pixel = imageData[((width + (height * stageWidth)) * 4) - 1];
        
        // アルファ値が0でない（透明でない）かつ画面内の場合、座標を追加
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

    console.log(`${particles.length}個のパーティクル座標を生成しました`);
    return particles;
  }
}
