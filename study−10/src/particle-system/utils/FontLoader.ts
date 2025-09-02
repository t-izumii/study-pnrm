/**
 * フォント読み込み専用ユーティリティクラス
 * Google Fontsからフォントを非同期で読み込み、ブラウザにロードします
 */

export interface FontLoadOptions {
  familyName: string;
  weights?: string[]; // フォントウェイト（例: ['400', '700']）
  subsets?: string[]; // 文字セット（例: ['latin', 'japanese']）
}

export class FontLoader {
  private static readonly GOOGLE_API_URL =
    "https://fonts.googleapis.com/css?family=";
  private static loadedFonts = new Set<string>(); // 読み込み済みフォントのキャッシュ
  private static loadingFonts = new Map<string, Promise<void>>(); // 読み込み中フォントのPromiseキャッシュ

  /**
   * Google Fontsからフォントを読み込む非同期メソッド
   *
   * @param options フォント読み込みオプション
   */
  static async loadFont(options: FontLoadOptions): Promise<void> {
    const { familyName, weights = ["400"], subsets = ["latin"] } = options;
    const fontKey = `${familyName}_${weights.join(",")}_${subsets.join(",")}`;

    console.log(`フォントキー生成: ${fontKey}`);
    console.log(`現在のキャッシュ:`, Array.from(this.loadedFonts));

    // 既に読み込み済みの場合はスキップ
    if (this.loadedFonts.has(fontKey)) {
      console.log(`フォント "${familyName}" は既に読み込み済みです`);
      return;
    }

    // 現在読み込み中の場合は、その Promise を待つ
    if (this.loadingFonts.has(fontKey)) {
      console.log(`フォント "${familyName}" は読み込み中です。完了を待機...`);
      return await this.loadingFonts.get(fontKey)!;
    }

    // 新しい読み込みを開始
    const loadPromise = this.performFontLoad(
      familyName,
      weights,
      subsets,
      fontKey
    );
    this.loadingFonts.set(fontKey, loadPromise);

    try {
      await loadPromise;
    } finally {
      this.loadingFonts.delete(fontKey);
    }
  }

  private static async performFontLoad(
    familyName: string,
    weights: string[],
    subsets: string[],
    fontKey: string
  ): Promise<void> {
    try {
      // Google Fonts URLを構築
      const urlFamilyName = familyName.replace(/ /g, "+");
      let googleApiUrl = `${this.GOOGLE_API_URL}${urlFamilyName}`;

      // ウェイトを追加
      if (weights.length > 0) {
        googleApiUrl += `:${weights.join(",")}`;
      }

      // サブセットを追加
      if (subsets.length > 0) {
        googleApiUrl += `&subset=${subsets.join(",")}`;
      }

      console.log(`フォント読み込み開始: ${familyName} from ${googleApiUrl}`);

      // Google Fonts APIからCSSデータを取得
      const response = await fetch(googleApiUrl);
      if (!response.ok) {
        throw new Error(`フォントの取得に失敗しました: ${response.status}`);
      }

      // CSSテキストを解析してフォントファイルのURLを抽出
      const css = await response.text();
      const matchUrls = css.match(/url\(.+?\)/g);

      if (!matchUrls || matchUrls.length === 0) {
        throw new Error("フォントURLが見つかりませんでした");
      }

      // 各ウェイトのフォントを読み込み
      const fontPromises = matchUrls.map(async (url, index) => {
        const weight = weights[index % weights.length];
        const font = new FontFace(`${familyName}`, url, { weight });
        await font.load();
        document.fonts.add(font);
        console.log(`フォント "${familyName}" weight ${weight} 読み込み完了`);
      });

      await Promise.all(fontPromises);

      // 読み込み完了をキャッシュに記録
      this.loadedFonts.add(fontKey);
      console.log(
        `フォント "${familyName}" の全ウェイト読み込みが完了しました`
      );
    } catch (error) {
      // フォント読み込み失敗時もアプリケーションを継続
      console.error("フォントの読み込みに失敗しました:", error);
      console.warn("デフォルトフォントで継続します");
    }
  }

  /**
   * 複数のフォントを一括で読み込む
   *
   * @param fontOptions フォントオプションの配列
   */
  static async loadMultipleFonts(
    fontOptions: FontLoadOptions[]
  ): Promise<void> {
    console.log(`${fontOptions.length}個のフォントを読み込み開始...`);

    const promises = fontOptions.map((options) => this.loadFont(options));
    await Promise.allSettled(promises); // 一部失敗しても他の読み込みを継続

    console.log("複数フォント読み込み処理完了");
  }

  /**
   * 指定されたフォントが読み込み済みかチェック
   *
   * @param familyName フォント名
   */
  static isFontLoaded(familyName: string): boolean {
    // document.fonts.check() を使用してフォントの可用性をチェック
    return document.fonts.check(`12px "${familyName}"`);
  }

  /**
   * すべてのフォント読み込みの完了を待つ
   */
  static async waitForFontsReady(): Promise<void> {
    try {
      await document.fonts.ready;
      console.log("全フォントの読み込みが完了しました");
    } catch (error) {
      console.warn("フォント読み込み待機中にエラーが発生しました:", error);
    }
  }
}
