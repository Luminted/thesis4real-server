import { GameState, Directions, CardEntity, Client, DeckEntity, ClientHand } from "../types/dataModelDefinitions";
 

export const initialGameState: GameState = {
    cards: new Map<string, CardEntity>(),
    clients: new Map<string, Client>(),
    decks: new Map<string, DeckEntity>(),
    hands: new Map<string, ClientHand>(),
    cardScale: 1,
    cardBoundary: null,
    deckBoundary: null,
    topZIndex:0,
    emptySeats: [Directions.NORTH, Directions.NORTH_EAST, Directions.NORTH_WEST, Directions.SOUTH, Directions.SOUTH_EAST, Directions.SOUTH_WEST]
}