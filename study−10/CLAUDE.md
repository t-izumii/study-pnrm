# Particle System Project

## プロジェクト概要
PIXI.jsとTypeScriptで作成されたWebベースのパーティクルシステム。HTMLの要素（テキストや画像）からパーティクルを生成し、物理演算やマウスインタラクションを提供する。

## 技術スタック
- **フレームワーク**: Vite
- **言語**: TypeScript 5.8.3
- **レンダリング**: PIXI.js v7.4.2 (WebGL)
- **ビルドツール**: Vite 7.1.2

## プロジェクト構造

### エントリーポイント
- `index.html`: HTMLエントリーポイント、`[data-particle]`属性でパーティクル生成対象を指定
- `src/main.ts`: アプリケーションメイン、PIXI.jsアプリケーションの初期化とパーティクルシステムの起動

### パーティクルシステム (`src/particle-system/`)

#### コアモジュール (`core/`)
- **`TextureGenerator.ts`**: HTMLセレクターからパーティクル座標を生成
  - テキスト要素からの座標生成（フォント設定を自動取得）
  - 画像要素からの座標生成（アスペクト比保持）
  - 六角格子パターンでの配置
  - キャンバス2D APIを使用したピクセル解析

- **`ParticleSystem.ts`**: パーティクルの管理とアニメーション制御
- **`Particle.ts`**: 個々のパーティクルクラス

#### 物理演算 (`physics/`)
- **`PhysicsEngine.ts`**: パーティクルの物理計算
- **`MouseInteraction.ts`**: マウスとパーティクルのインタラクション

#### 設定・型定義
- **`config/particle-config.ts`**: パーティクル生成・動作設定
- **`types/particle-types.ts`**: TypeScript型定義
- **`index.ts`**: モジュールエクスポート

## 主要機能

### 1. HTML要素からのパーティクル生成
```html
<div data-particle data-tex="text" style="font-size: 80px; font-family: Arial">
  TEST
</div>
```

### 2. 画像からのパーティクル生成
```html
<img data-particle data-tex="img" src="path/to/image.png" />
```

### 3. 物理演算とインタラクション
- マウス追従・反発効果
- パーティクル間の物理計算
- アニメーションループ

## 開発コマンド
```bash
npm run dev      # 開発サーバー起動
npm run build    # TypeScriptコンパイル + ビルド
npm run preview  # ビルド済みアプリのプレビュー
```

## 実装詳細

### TextureGenerator の動作フロー
1. `generateFromHTMLSelector()`: セレクターで要素を取得
2. `data-tex`属性で処理タイプを判定（"text" | "img"）
3. テキスト: CSSスタイルを取得してキャンバスに描画
4. 画像: アスペクト比を保持してキャンバスに描画  
5. `dotPos()`: キャンバスのピクセルデータを解析してパーティクル座標を生成
6. 六角格子パターンで配置（偶数行を6px右にオフセット）

### 現在の動作
- 画面サイズに合わせてPIXI.jsキャンバスを作成
- "TEST"テキスト（80px Arial）からパーティクルを生成
- リアルタイムアニメーション実行

### デバッグ
- `console.log(imageData)` (TextureGenerator.ts:189): ピクセルデータの確認
- `console.log('生成された座標数: ${positions.length}')` (main.ts:35): パーティクル数の確認