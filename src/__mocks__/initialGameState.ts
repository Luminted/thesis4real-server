import { GameState } from "../types/dataModelDefinitions";

export const initialGameState: GameState = {
    cards: [],
    clients: [],
    decks: [],
    hands: [],
    cardScale: 1,
    cardBoundary: null,
    deckBoundary: null
}