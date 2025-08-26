# WebGL DOM連動ライブラリ

DOM要素にWebGLエフェクトを簡単に適用できるライブラリです。

## 特徴

- **宣言的な記述**: data属性でWebGLエフェクトを指定
- **自動リソース管理**: テクスチャとジオメトリの効率的な管理
- **エラーハンドリング**: 堅牢なエラー処理とフォールバック機能
- **パフォーマンス監視**: フレームレートとメモリ使用量の監視
- **TypeScript完全対応**: 型安全な開発環境

## 使用方法

### 基本的な使用例

```html
<!-- リップルエフェクト -->
<img 
  data-webgl="ripple" 
  data-cover="true"
  data-hover-intensity="1.5"
  src="/images/hero.jpg"
  alt="Hero Image"
/>
```

### JavaScript初期化

```typescript
import WebGLApp from '@webgl/WebGLApp';

const main = async () => {
  try {
    const webglApp = new WebGLApp();
    
    // エラーハンドリングを設定
    webglApp.setErrorCallback((error) => {
      console.warn(`WebGL Error: ${error.message} in ${error.context}`);
      // 必要に応じてユーザー通知
    });
    
    await webglApp.init();
    console.log('WebGL初期化完了');
    
    // 登録済みオブジェクトタイプを確認
    console.log('Available types:', webglApp.getRegisteredObjectTypes());
    
  } catch (error) {
    console.error('初期化エラー:', error);
    
    // WebGL未対応時のフォールバック
    if (error.message.includes('WebGL')) {
      document.querySelectorAll('[data-webgl]').forEach(el => {
        el.style.opacity = '1'; // 通常表示に戻す
      });
    }
  }
};
```

### プラグインシステム

新しいWebGLオブジェクトを動的に追加できます：

```typescript
import { registerPlugin } from '@webgl/registry/registerObjects';

// カスタムエフェクトクラス
class CustomEffect extends BaseObject {
  constructor(element, viewportWidth, viewportHeight, options) {
    super(element, viewportWidth, viewportHeight);
    this.intensity = options?.intensity || 1.0;
  }
  
  async init() {
    // エフェクトの初期化
    return mesh;
  }
  
  // その他の必要なメソッド...
}

// プラグインとして登録
registerPlugin('custom-effect', CustomEffect, {
  defaultOptions: {
    intensity: 1.0,
    color: '#ff6b6b'
  },
  description: 'カスタムエフェクト',
  category: 'custom'
});
```

```html
<!-- すぐに使用可能 -->
<img data-webgl="custom-effect" data-intensity="2.0" src="image.jpg" />
```

## API

### WebGLApp

#### `new WebGLApp()`
WebGLアプリケーションのインスタンスを作成

#### `init(): Promise<void>`
アプリケーションを初期化

#### `setErrorCallback(callback: ErrorCallback): void`
エラー時のコールバックを設定

#### `registerObjectType(type, constructor, options?): void`
新しいWebGLオブジェクトを動的に登録

#### `getRegisteredObjectTypes(): string[]`
登録済みオブジェクトタイプ一覧を取得

#### `getStats(): AppStats`
パフォーマンス統計を取得

#### `dispose(): void`
リソースを破棄

### data属性

#### `data-webgl`
WebGLオブジェクトのタイプを指定
- `"ripple"`: リップルエフェクト
- `"wave"`: 波打ちエフェクト
- カスタム登録したタイプ

#### `data-cover`
画像のobject-fit: cover機能（ripple専用）
- `"true"`: 有効
- `"false"`: 無効

#### `data-hover-intensity`
ホバー時のエフェクト強度（ripple専用）
- 数値: 0.0 〜 2.0 程度

## 開発

### セットアップ

```bash
npm install
npm run dev
```

### ビルド

```bash
npm run build
```

## 注意事項

- WebGLに対応していないブラウザでは自動的に通常表示にフォールバック
- data-webgl属性を持つ要素は初期状態でopacity: 0に設定される
- エラーが10回を超えると自動的にWebGLが停止される

## デバッグ機能

### 位置同期のデバッグ

WebGLオブジェクトとDOM要素の位置がずれている場合のデバッグ方法：

```typescript
// デバッグモードを有効化
webglApp.enableDebugMode();

// またはコンソールで
webglDebug.enable();

// 特定要素をハイライト
webglDebug.highlight('[data-webgl]', '#ff0000');
```

### 自動チェック機能

デバッグモードでは以下が自動的にチェックされます：

- DOM要素とWebGLオブジェクトの位置同期
- スクロール時の位置追従
- 座標変換の正確性

### 一般的な問題と解決策

**問題: WebGLオブジェクトが画像とずれている**

1. **スクロール位置の考慮不足**
   - 修正: `getBoundingClientRect()`にスクロールオフセットを追加

2. **CSS Transformの影響**
   - 修正: `getComputedStyle()`でtransformをチェック

3. **カメラの設定ミス**
   - 修正: FOVと距離の関係を再計算

4. **ピクセル比の問題**
   - 修正: `devicePixelRatio`を考慮した座標計算

```typescript
// 位置修正の例
protected updateTransform(): void {
  const rect = this.element.getBoundingClientRect();
  const scrollY = window.pageYOffset;
  const scrollX = window.pageXOffset;
  
  // スクロールを考慮した実際の位置
  const elementTop = rect.top + scrollY;
  const elementLeft = rect.left + scrollX;
  
  const x = elementLeft + rect.width / 2 - this.viewportWidth / 2;
  const y = -(elementTop + rect.height / 2 - this.viewportHeight / 2);
  
  this.mesh.position.set(x, y, 0);
}
```

### 自動復旧機能

ライブラリには以下の自動復旧機能が組み込まれています：

- **WebGLコンテキストロスト**: 自動的に復旧を試行
- **レンダリングエラー**: レンダラーのリセットを実行
- **オブジェクトエラー**: 問題のあるオブジェクトを自動削除
- **緊急停止**: エラー数が上限を超えた場合の安全停止

### エラーコールバック例

```typescript
webglApp.setErrorCallback((error) => {
  // ログ記録
  console.error(`[${error.context}] ${error.message}`, error.stack);
  
  // ユーザー通知（必要に応じて）
  if (error.context === 'initialization') {
    showNotification('WebGLの初期化に失敗しました', 'error');
  }
  
  // 分析ツールへの送信
  analytics.track('webgl_error', {
    context: error.context,
    message: error.message,
    timestamp: error.timestamp
  });
});
```

## パフォーマンス監視

### 統計情報の取得

```typescript
const stats = webglApp.getStats();
console.log({
  objectCount: stats.objectCount,     // アクティブなオブジェクト数
  textureCount: stats.textureCount,   // ロード済みテクスチャ数
  frameTime: stats.frameTime,         // フレーム時間（ms）
  errorCount: stats.errorCount        // エラー発生数
});
```

### 自動品質調整（推奨）

```typescript
// パフォーマンス監視ループ
setInterval(() => {
  const stats = webglApp.getStats();
  
  // フレーム時間が長い場合は品質を下げる
  if (stats.frameTime > 16.67) { // 60fps = 16.67ms
    console.warn('パフォーマンス低下を検出');
    // 品質調整ロジック
  }
  
  // エラー率をチェック
  if (stats.errorCount > 5) {
    console.warn('エラー多発を検出');
    webglApp.resetErrorCount();
  }
}, 5000);
```

## 対応オブジェクト

### Ripple

画像にリップル（波紋）エフェクトを適用

```html
<img 
  data-webgl="ripple"
  data-cover="true"           <!-- object-fit: cover -->
  data-hover-intensity="1.5"  <!-- ホバー強度 -->
  src="image.jpg"
/>
```

**パラメーター:**
- `data-cover`: boolean - Cover機能の有効/無効
- `data-hover-intensity`: number - ホバー時のエフェクト強度

**機能:**
- マウスホバーでリップルエフェクト
- object-fit: cover相当の画像表示
- スムーズなアニメーション遷移

### Wave

画像に波打ちエフェクトを適用

```html
<img 
  data-webgl="wave"
  data-cover="true"      <!-- object-fit: cover -->
  data-amplitude="0.1"   <!-- 振幅 -->
  data-frequency="2.0"   <!-- 周波数 -->
  data-speed="1.0"       <!-- アニメーション速度 -->
  src="image.jpg"
/>
```

**パラメーター:**
- `data-cover`: boolean - Cover機能の有効/無効
- `data-amplitude`: number - 波の振幅 (0.0 〜 1.0)
- `data-frequency`: number - 波の周波数 (1.0 〜 10.0)
- `data-speed`: number - アニメーション速度

**機能:**
- 連続した波打ちアニメーション
- カスタマイズ可能な波のパラメーター
- object-fit: cover相当の画像表示

## 拡張性

### オブジェクトレジストリシステム

switch文を使わず、プラグイン形式でオブジェクトを追加できます：

```typescript
// 1. カスタムエフェクトを作成
class GlitchEffect extends BaseObject {
  async init() {
    // グリッチエフェクトの実装
  }
}

// 2. レジストリに登録
webglApp.registerObjectType('glitch', GlitchEffect, {
  defaultOptions: {
    intensity: 0.5,
    frequency: 1.0
  },
  description: 'グリッチエフェクト',
  category: 'effect'
});

// 3. HTMLで即座に使用可能
// <img data-webgl="glitch" src="image.jpg" />
```

### 動的読み込み

```typescript
// 動的インポートでオブジェクトを追加
const loadCustomEffects = async () => {
  const { default: ParticleEffect } = await import('./effects/ParticleEffect');
  
  webglApp.registerObjectType('particles', ParticleEffect, {
    category: 'particle',
    defaultOptions: { count: 100 }
  });
};
```

## ブラウザ対応

- **Chrome**: 最新版
- **Firefox**: 最新版
- **Safari**: 最新版
- **Edge**: 最新版

**WebGL要件:**
- WebGL 1.0対応
- フラグメントシェーダー対応
- GLSL ES 1.0対応

## 既知の制限事項

1. **モバイルブラウザ**: 一部の古いモバイルブラウザではパフォーマンスが制限される場合があります
2. **メモリ**: 大量の画像を同時に処理する場合はメモリ使用量にご注意ください
3. **CORS**: 外部ドメインの画像を使用する場合はCORS設定が必要です

## ライセンス

MIT License

## 貢献

バグ報告や機能要望は[Issues](link-to-issues)までお願いします。

---

**重要な修正内容:**
- ✅ ファイル名タイポ修正
- ✅ イベントリスナーメモリリーク修正
- ✅ エラーハンドリング強化
- ✅ WebGLサポート自動検出
- ✅ 自動復旧機能追加
- ✅ パフォーマンス監視機能
