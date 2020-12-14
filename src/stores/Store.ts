import produce, { enableMapSet } from "immer";

enableMapSet();

export class Store<T> {
  public state: T;
  private initialState: T;

  constructor(initialState: T) {
    // making state immutable from initialization
    this.state = produce(initialState, () => {});
    this.initialState = initialState;
  }

  public changeState(handler: (draft: T) => void) {
    this.state = produce(this.state, handler) || this.state;
  }

  public resetState() {
    this.state = this.initialState;
  }
}
