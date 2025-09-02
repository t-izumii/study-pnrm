import type { ParticleAppOptions } from "../../types/particle-types";
import { FontLoader } from "../../utils/FontLoader";

/**
 * フォント設定の正規化結果
 */
export interface ResolvedFontConfig {
  familyName: string;
  googleFont: {
    familyName: string;
    weights?: string[];
    subsets?: string[];
  } | null;
}

/**
 * フォント関連の設定管理を担当するクラス
 *
 * 責任:
 * - フォント設定の正規化
 * - Google Fontsの非同期読み込み
 * - フォールバック処理
 */
export class FontManager {
  private readonly options: ParticleAppOptions;

  constructor(options: ParticleAppOptions) {
    this.options = options;
  }

  /**
   * フォント設定を正規化
   */
  extractFontConfig(): ResolvedFontConfig {
    const { font } = this.options;

    // 文字列で指定された場合（既存互換性）
    if (typeof font === "string") {
      return {
        familyName: font,
        googleFont: null,
      };
    }

    // オブジェクトで指定された場合
    if (font && typeof font === "object") {
      if (font.googleFont) {
        return {
          familyName: font.googleFont.familyName,
          googleFont: font.googleFont,
        };
      } else if (font.family) {
        return {
          familyName: font.family,
          googleFont: null,
        };
      }
    }

    // デフォルトフォント
    return {
      familyName: "Arial",
      googleFont: null,
    };
  }

  /**
   * 必要に応じてGoogle Fontを読み込み
   */
  async loadFontIfRequired(): Promise<void> {
    const fontConfig = this.extractFontConfig();

    if (!fontConfig.googleFont) {
      return;
    }

    try {
      console.log(`Google Font読み込み中: ${fontConfig.googleFont.familyName}`);
      await FontLoader.loadFont(fontConfig.googleFont);
      console.log(
        `Google Font読み込み完了: ${fontConfig.googleFont.familyName}`
      );
    } catch (error) {
      console.warn(
        `Google Font読み込み失敗: ${fontConfig.googleFont.familyName}`,
        error
      );
      // フォールバック処理は呼び出し側で行う
    }
  }

  /**
   * フォント文字列を生成
   */
  generateFontString(size: number): string {
    const fontConfig = this.extractFontConfig();
    const weight = this.options.weight || "normal";
    const fontString = `${weight} ${size}px "${fontConfig.familyName}"`;

    console.log(`フォント文字列生成: ${fontString}`);

    // フォントが利用可能かチェック
    if (fontConfig.googleFont && !this.isFontAvailable(fontConfig.familyName)) {
      console.warn(
        `フォント "${fontConfig.familyName}" が利用できません。Arial で代替します。`
      );
    }

    return fontString;
  }

  /**
   * フォントが利用可能かチェック
   */
  isFontAvailable(fontFamily: string): boolean {
    // Canvas APIを使用してフォントの利用可能性をチェック
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return false;
    }

    // 参照フォントでテキストを描画
    context.font = "12px monospace";
    const referenceWidth = context.measureText("test").width;

    // 指定フォントでテキストを描画
    context.font = `12px "${fontFamily}", monospace`;
    const testWidth = context.measureText("test").width;

    // 幅が異なれば指定フォントが利用可能
    return referenceWidth !== testWidth;
  }
}
