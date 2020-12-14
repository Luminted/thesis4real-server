import { Store } from "../Store";
import {
  TGameState,
  ICardEntity,
  TClient,
  IDeckEntity,
  TClientHand,
} from "../../typings";
import { Singleton } from "typescript-ioc";

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
