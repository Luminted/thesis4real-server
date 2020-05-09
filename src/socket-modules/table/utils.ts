import { GameState, SerializedGameState } from "../../types/dataModelDefinitions";

export function serializeGameState(gameState: GameState): SerializedGameState {
    return {
        cards: [...gameState.cards.values()],
        clients: [...gameState.clients.values()],
        hands: [...gameState.hands.values()],
        decks: [...gameState.decks.values()],
    }
}