import { EErrorTypes } from "./typings";

export class StateHandlerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = EErrorTypes.StateHandlerError;
  }
}
