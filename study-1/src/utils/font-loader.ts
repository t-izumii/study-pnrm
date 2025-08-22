import { FONT_CONFIG } from '../config';

export class FontLoader {
  static async loadFont(): Promise<void> {
    const urlFamilyName = FONT_CONFIG.familyName.replace(/ /g, "+");
    const googleApiUrl = `${FONT_CONFIG.googleApiUrl}${urlFamilyName}`;

    try {
      const response = await fetch(googleApiUrl);
      if (!response.ok) {
        throw new Error('フォントの取得に失敗しました');
      }

      const css = await response.text();
      const matchUrls = css.match(/url\(.+?\)/g);
      
      if (!matchUrls) {
        throw new Error("フォントが見つかりませんでした");
      }

      const url = matchUrls[0];
      const font = new FontFace(FONT_CONFIG.familyName, url);
      await font.load();
      document.fonts.add(font);
    } catch (error) {
      console.error('フォントの読み込みに失敗しました:', error);
      // フォント読み込み失敗時もアプリケーションを継続
    }
  }
}
