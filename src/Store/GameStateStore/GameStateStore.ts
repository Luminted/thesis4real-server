import { Store } from "../Store";
import { GameState, Seats, CardEntity, Client, DeckEntity, ClientHand } from "../../types/dataModelDefinitions";

const initialState = {
    cards: new Map<string, CardEntity>(),
    clients: new Map<string, Client>(),
    decks: new Map<string, DeckEntity>(),
    hands: new Map<string, ClientHand>(),
    entityScale: 1,
    topZIndex: 0,
    emptySeats: [Seats.NORTH, Seats.SOUTH]
}

export class GameStateStore extends Store<GameState> {
    constructor(){
        super(initialState)
    }
}