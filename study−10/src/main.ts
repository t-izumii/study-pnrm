import "./style.css";
import * as PIXI from "pixi.js";
import {
  ParticleSystem,
  TextureGenerator,
  PARTICLE_GENERATION_CONFIG,
} from "./particle-system";

async function main() {
  // PIXI.jsアプリケーション初期化
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0xffffff,
  });

  document.body.appendChild(app.view as HTMLCanvasElement);

  // パーティクル用テクスチャ作成
  const texture = PIXI.Texture.WHITE;

  // ParticleSystem初期化
  const particleSystem = new ParticleSystem(texture);

  // TextureGenerator初期化
  const textureGenerator = new TextureGenerator();

  // HTMLからパーティクル座標を生成
  textureGenerator.generateFromHTMLSelector(
    "[data-particle]",
    PARTICLE_GENERATION_CONFIG.density,
    window.innerWidth,
    window.innerHeight,
    (positions) => {
      console.log(`生成された座標数: ${positions.length}`);

      // パーティクル作成
      particleSystem.createParticles(positions, app.stage);

      // アニメーションループ開始
      app.ticker.add(() => {
        particleSystem.animate();
      });
    }
  );

  console.log("TextureGenerator統合テスト開始！");
}

main().catch(console.error);
