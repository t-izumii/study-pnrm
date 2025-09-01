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
    size: 150,
    font: {
      googleFont: {
        familyName: "Noto Sans JP",
        weights: ["500"],
        subsets: ["latin", "japanese"],
      },
    },
  });

  const app2 = new ParticleApp(".js-ParticleText2", {
    type: "text",
    text: "TEST",
    weight: 500,
    density: 1,
    scale: 1,
    blur: 1,
    font: {
      family: "Helvetica", // システムフォント
    },
  });

  const app3 = new ParticleApp(".js-ParticleImg", {
    type: "image",
    imageSrc: "/image.png",
    width: 600,
    density: 1,
    scale: 1,
    blur: 1,
  });
}

main().catch(console.error);
