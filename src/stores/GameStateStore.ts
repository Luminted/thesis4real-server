import { Singleton } from "typescript-ioc";
import { ICardEntity, IDeckEntity, TClient, TClientHand, TGameState } from "../typings";
import { Store } from "./Store";

const initialState: TGameState = {
  cards: new Map<string, ICardEntity>(),
  clients: new Map<string, TClient>(),
  decks: new Map<string, IDeckEntity>(),
  hands: new Map<string, TClientHand>(),
  topZIndex: 0,
};

@Singleton
export class GameStateStore extends Store<TGameState> {
  constructor() {
    super(initialState);
  }
}
