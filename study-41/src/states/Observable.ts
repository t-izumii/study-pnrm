export abstract class Observable {
  protected _listeners: Set<() => void> = new Set();

  subscribe(callback: () => void): () => void {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  protected notify(): void {
    this._listeners.forEach(callback => callback());
  }

  destroy(): void {
    this._listeners.clear();
  }
}