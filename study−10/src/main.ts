import "./style.css";
import { ParticleApp } from "./particle-system";

async function main() {
  const app1 = new ParticleApp(".js-ParticleText", {
    type: "text",
    text: "TEST",
    weight: 500,
    density: 1,
    scale: 1,
    blur: 1,
    threshold: 0.9,
    size: 100,
    mouseRadius: 20,
    friction: 0.9, // 摩擦係数（デフォルト: 0.86）
    moveSpeed: 0.1, // 復元力（デフォルト: 0.1）
    color: 0xff0000, // 赤色パーティクル（デフォルト: 0x000000）
    font: {
      googleFont: {
        familyName: "Noto Sans JP",
        weights: ["500"],
      },
    },
    breakpoints: {
      680: { size: 100 },
    },
  });

  const app2 = new ParticleApp(".js-ParticleText2", {
    type: "text",
    text: "TEST",
    weight: 500,
    density: 4,
    scale: 2,
    blur: 0,
    size: 120,
    mouseRadius: 50,
    font: {
      family: "Helvetica", // システムフォント
    },
    breakpoints: {
      680: {
        size: 200,
        mouseRadius: 100,
      },
    },
  });

  const app3 = new ParticleApp(".js-ParticleText3", {
    type: "text",
    text: "TEST",
    weight: 500,
    density: 1,
    scale: 1,
    blur: 1,
    size: 50,
    mouseRadius: 20,
    font: {
      googleFont: {
        familyName: "Noto Sans JP",
        weights: ["500"],
      },
    },
    breakpoints: {
      680: { size: 100 },
    },
  });

  const app4 = new ParticleApp(".js-ParticleImg", {
    type: "image",
    imageSrc: "/image.png",
    width: 300,
    density: 1,
    scale: 1,
    blur: 1,
    breakpoints: {
      680: { width: 600 },
    },
  });
}

main().catch(console.error);
