import WebGLApp from "./webgl/index";

const app = new WebGLApp(document.body, window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
  app.resize(window.innerWidth, window.innerHeight);
});
