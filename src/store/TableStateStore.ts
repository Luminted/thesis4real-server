import { Singleton } from "typescript-ioc";
import { numberOfSeats } from "../config";
import { TCardTable } from "../typings";
import { Store } from "./Store";

const initialState: TCardTable = {
  defaultPosition: [0, 0],
  emptySeats: new Array(numberOfSeats).fill(null).map((_, index) => `${index + 1}`),
  socketIdMapping: {},
};

@Singleton
export class TableStateStore extends Store<TCardTable> {
  constructor() {
    super(initialState);
  }
}
