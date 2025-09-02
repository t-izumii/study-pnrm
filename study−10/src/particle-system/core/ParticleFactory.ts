import { ParticleApp } from './ParticleApp';
import type { TextParticleOptions, ImageParticleOptions, ParticleAppOptions } from '../types/particle-types';

/**
 * パーティクルシステム作成用のファサードクラス
 * 
 * 責任:
 * - 型安全なパーティクルアプリケーション作成
 * - 設定の検証とデフォルト値の適用
 * - エラーハンドリングの統一
 */
export class ParticleFactory {
  /**
   * テキストパーティクルアプリケーションを作成
   */
  static createTextParticle(
    selector: string,
    options: Omit<TextParticleOptions, 'type'>
  ): ParticleApp {
    const fullOptions: TextParticleOptions = {
      type: 'text',
      ...options
    };

    this.validateTextOptions(fullOptions);
    return new ParticleApp(selector, fullOptions);
  }

  /**
   * 画像パーティクルアプリケーションを作成
   */
  static createImageParticle(
    selector: string,
    options: Omit<ImageParticleOptions, 'type'>
  ): ParticleApp {
    const fullOptions: ImageParticleOptions = {
      type: 'image',
      ...options
    };

    this.validateImageOptions(fullOptions);
    return new ParticleApp(selector, fullOptions);
  }

  /**
   * 汎用パーティクルアプリケーションを作成（後方互換性）
   */
  static create(selector: string, options: ParticleAppOptions): ParticleApp {
    if (options.type === 'text') {
      this.validateTextOptions(options);
    } else if (options.type === 'image') {
      this.validateImageOptions(options);
    }

    return new ParticleApp(selector, options);
  }

  /**
   * 複数のパーティクルアプリケーションを一括作成
   */
  static createMultiple(
    configs: Array<{ selector: string; options: ParticleAppOptions }>
  ): ParticleApp[] {
    return configs.map(({ selector, options }) => 
      this.create(selector, options)
    );
  }

  /**
   * プリセット設定でテキストパーティクルを作成
   */
  static createTextWithPreset(
    selector: string,
    text: string,
    preset: 'default' | 'large' | 'small' | 'colorful' = 'default'
  ): ParticleApp {
    const presets = {
      default: {
        text,
        size: 100,
        density: 1,
        scale: 1,
        mouseRadius: 20,
      },
      large: {
        text,
        size: 150,
        density: 1,
        scale: 1.5,
        mouseRadius: 30,
      },
      small: {
        text,
        size: 60,
        density: 2,
        scale: 0.8,
        mouseRadius: 15,
      },
      colorful: {
        text,
        size: 100,
        density: 1,
        scale: 1,
        mouseRadius: 25,
        color: 0xff6b6b,
        blur: 2,
      }
    };

    return this.createTextParticle(selector, presets[preset]);
  }

  /**
   * テキストオプションの検証
   */
  private static validateTextOptions(options: TextParticleOptions): void {
    if (!options.text || options.text.trim() === '') {
      throw new Error('ParticleFactory: テキストパーティクルには text プロパティが必須です');
    }

    if (options.size !== undefined && options.size <= 0) {
      throw new Error('ParticleFactory: フォントサイズは正の数である必要があります');
    }
  }

  /**
   * 画像オプションの検証
   */
  private static validateImageOptions(options: ImageParticleOptions): void {
    if (!options.imageSrc || options.imageSrc.trim() === '') {
      throw new Error('ParticleFactory: 画像パーティクルには imageSrc プロパティが必須です');
    }

    if (options.width !== undefined && options.width <= 0) {
      throw new Error('ParticleFactory: 画像の幅は正の数である必要があります');
    }

    if (options.height !== undefined && options.height <= 0) {
      throw new Error('ParticleFactory: 画像の高さは正の数である必要があります');
    }
  }

  /**
   * デフォルト設定を取得
   */
  static getDefaultTextOptions(): Partial<TextParticleOptions> {
    return {
      size: 100,
      density: 1,
      scale: 1,
      blur: 1,
      mouseRadius: 20,
      friction: 0.9,
      moveSpeed: 0.1,
      color: 0x000000,
      threshold: 0.9,
    };
  }

  static getDefaultImageOptions(): Partial<ImageParticleOptions> {
    return {
      width: 400,
      density: 1,
      scale: 1,
      blur: 1,
      mouseRadius: 20,
      friction: 0.9,
      moveSpeed: 0.1,
      color: 0x000000,
      threshold: 0.9,
    };
  }
}