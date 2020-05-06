import { GameState } from "../../../types/dataModelDefinitions";

export function optimizeSyncSize(prevState: GameState, nextState: GameState) {
    const syncState: GameState = {
        cards: [],
        decks: [],
        clients: [],
        hands: [],
        cardScale: prevState.cardScale,
        emptySeats: prevState.emptySeats,
        cardBoundary: prevState.cardBoundary,
        deckBoundary: prevState.deckBoundary
    }

    //differentiating cards
    const changedCards = prevState.cards

    return syncState;
}