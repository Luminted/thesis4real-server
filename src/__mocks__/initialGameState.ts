import { GameState, Directions } from "../types/dataModelDefinitions";

export const initialGameState: GameState = {
    cards: [],
    clients: [],
    decks: [],
    hands: [],
    cardScale: 1,
    cardBoundary: null,
    deckBoundary: null,
    emptySeats: [Directions.NORTH, Directions.NORTH_EAST, Directions.NORTH_WEST, Directions.SOUTH, Directions.SOUTH_EAST, Directions.SOUTH_WEST]
}