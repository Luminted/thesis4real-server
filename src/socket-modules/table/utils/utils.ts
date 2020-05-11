import { GameState, SerializedGameState, Entity } from "../../../types/dataModelDefinitions";
import produce, {} from "immer";

export function serializeGameState(gameState: GameState): SerializedGameState {
    return {
        cards: [...gameState.cards.values()],
        clients: [...gameState.clients.values()],
        hands: [...gameState.hands.values()],
        decks: [...gameState.decks.values()],
    }
}

export function resetZIndexes(entities: Map<string,Entity>, absoluteNumberOfEntities: number, zIndexLimit: number){
    const resetEntities = new Map<string, Entity>();
    for(let [entityId, entity] of entities){
        resetEntities.set(entityId, {
            ...entity,
            zIndex: entity.zIndex - zIndexLimit + absoluteNumberOfEntities - 1
        })
    }
    return resetEntities;
}