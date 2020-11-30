import { GameState, SerializedGameState } from "../types/dataModelDefinitions";

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function serializeGameState(gameState: GameState): SerializedGameState {
    return {
        cards: [...gameState.cards.values()],
        clients: [...gameState.clients.values()],
        hands: [...gameState.hands.values()],
        decks: [...gameState.decks.values()],
        entityScale: gameState.entityScale
    }
}

// WARNING: This function has side effects. Use it only with Immer draft!
export function calcNextZIndex(gameStateDraft: GameState, zIndexLimit: number){
    const {cards, decks} = gameStateDraft;
    const nextZIndex = ++gameStateDraft.topZIndex;
    if(nextZIndex > zIndexLimit){
        const absoluteNumberOfEntities = cards.size + decks.size;
        //resetting cards
        for(let [_, entity] of gameStateDraft.cards){
            entity.zIndex = entity.zIndex - zIndexLimit + absoluteNumberOfEntities - 1
        }

        //resetting decks
        for(let [_, entity] of gameStateDraft.decks){
            entity.zIndex = entity.zIndex - zIndexLimit + absoluteNumberOfEntities - 1
        }

        gameStateDraft.topZIndex = absoluteNumberOfEntities;
        return absoluteNumberOfEntities;
    }

    return nextZIndex;
}