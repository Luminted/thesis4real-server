import { EErrorTypes } from "./typings";

export class ExtractorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = EErrorTypes.ExtractorError;
  }
}
