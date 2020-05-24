import { GameState, Seats, CardEntity, Client, DeckEntity, ClientHand } from "../types/dataModelDefinitions";
 

export const initialGameState: GameState = {
    cards: new Map<string, CardEntity>(),
    clients: new Map<string, Client>(),
    decks: new Map<string, DeckEntity>(),
    hands: new Map<string, ClientHand>(),
    entityScale: 1,
    topZIndex:0,
    emptySeats: [Seats.NORTH, Seats.NORTH_EAST, Seats.NORTH_WEST, Seats.SOUTH, Seats.SOUTH_EAST, Seats.SOUTH_WEST]
}