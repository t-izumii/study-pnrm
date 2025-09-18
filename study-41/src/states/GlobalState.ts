import { MouseState } from "./MouseState";
import { ScrollState } from "./ScrollState";
import { ViewportState } from "./ViewportState";

export class GlobalState {
  public mouse: MouseState;
  public scroll: ScrollState;
  public viewport: ViewportState;

  private static _instance: GlobalState;

  private constructor() {
    this.mouse = new MouseState();
    this.scroll = new ScrollState();
    this.viewport = new ViewportState();
  }

  static getInstance(): GlobalState {
    if (!GlobalState._instance) {
      GlobalState._instance = new GlobalState();
    }
    return GlobalState._instance;
  }

  destroy() {
    this.mouse.destroy();
    this.scroll.destroy();
    this.viewport.destroy();
    GlobalState._instance = null as any;
  }
}

export const globalState = GlobalState.getInstance();