import "./style.css";
import { ParticleApp } from "./particle-system";

async function main() {
  const app1 = new ParticleApp(".js-ParticleText", {
    type: "text",
    text: "test",
    font: "arial",
    weight: 500,
  });

  const app2 = new ParticleApp(".js-ParticleImg", {
    type: "image",
    imageSrc: "/image.png",
  });
}

main().catch(console.error);
