/**
 * main.ts
 * WebGL DOM連動システムの初期化
 */

import './style.css';
import WebGLApp from './webgl';

const main = async (): Promise<void> => {
  console.log('🌟 アプリケーション開始');
  
  try {
    // WebGLアプリケーションを初期化
    const webglApp = new WebGLApp();
    
    // デバッグ用：グローバルに公開
    (window as any).webglApp = webglApp;
    
    console.log('🎉 初期化完了');
    console.log('💡 テクスチャなしでもカラフルなパターンが表示されるはずです');
    
    // テスト用の画像読み込み（オプション）
    // webglApp.loadTexture('https://picsum.photos/800/600');
    
  } catch (error) {
    console.error('💥 初期化エラー:', error);
  }
};

// DOM読み込み完了後に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
