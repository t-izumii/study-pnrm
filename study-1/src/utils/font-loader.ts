/**
 * フォント読み込み専用ユーティリティクラス
 * Google Fontsからフォントを非同期で読み込み、ブラウザにロードします
 */

import { FONT_CONFIG } from '../config';

export class FontLoader {
  /**
   * Google Fontsからフォントを読み込む非同期メソッド
   * 
   * 処理の流れ：
   * 1. Google Fonts APIからCSSを取得
   * 2. CSS内のフォントファイルURLを抽出
   * 3. FontFaceオブジェクトを作成してフォントを読み込み
   * 4. ブラウザのフォントリストに追加
   */
  static async loadFont(): Promise<void> {
    try {
      // フォント名をURL用にエンコード（スペースを+に変換）
      const urlFamilyName = FONT_CONFIG.familyName.replace(/ /g, "+");
      const googleApiUrl = `${FONT_CONFIG.googleApiUrl}${urlFamilyName}`;

      // Google Fonts APIからCSSデータを取得
      const response = await fetch(googleApiUrl);
      if (!response.ok) {
        throw new Error('フォントの取得に失敗しました');
      }

      // CSSテキストを解析してフォントファイルのURLを抽出
      const css = await response.text();
      const matchUrls = css.match(/url\(.+?\)/g);

      if (!matchUrls) {
        throw new Error("フォントが見つかりませんでした");
      }

      // 最初のフォントURLを使用してFontFaceオブジェクトを作成
      const url = matchUrls[0];
      const font = new FontFace(FONT_CONFIG.familyName, url);

      // フォントを読み込み、ブラウザに追加
      await font.load();
      document.fonts.add(font);

      console.log(`フォント "${FONT_CONFIG.familyName}" の読み込みが完了しました`);
    } catch (error) {
      // フォント読み込み失敗時もアプリケーションを継続
      console.error('フォントの読み込みに失敗しました:', error);
      console.warn('デフォルトフォントで継続します');
    }
  }
}
