import { Store } from "../Store";
import { TGameState, ICardEntity, TClient, IDeckEntity, TClientHand } from "../../typings";

const initialState: TGameState = {
    cards: new Map<string, ICardEntity>(),
    clients: new Map<string, TClient>(),
    decks: new Map<string, IDeckEntity>(),
    hands: new Map<string, TClientHand>(),
    entityScale: 1,
    topZIndex: 0,
}

export class GameStateStore extends Store<TGameState> {
    constructor(){
        super(initialState);
    }
}