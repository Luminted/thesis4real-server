import { GameState, SerializedGameState, Entity } from "../../../types/dataModelDefinitions";
import { Draft } from "immer";

export function serializeGameState(gameState: GameState): SerializedGameState {
    return {
        cards: [...gameState.cards.values()],
        clients: [...gameState.clients.values()],
        hands: [...gameState.hands.values()],
        decks: [...gameState.decks.values()],
    }
}

// WARNING: This function has side effects. Use it only with Immer draft!
export function calcNextZIndex(gameStateDraft: GameState, zIndexLimit: number){
    const {cards, decks} = gameStateDraft;
    const nextZIndex = ++gameStateDraft.topZIndex;
    const absoluteNumberOfEntities = cards.size + decks.size;
    if(nextZIndex > zIndexLimit){
        //resetting cards
        for(let [entityId, entity] of gameStateDraft.cards){
            entity.zIndex = entity.zIndex - zIndexLimit + absoluteNumberOfEntities - 1
        }

        //resetting decks
        for(let [entityId, entity] of gameStateDraft.decks){
            entity.zIndex = entity.zIndex - zIndexLimit + absoluteNumberOfEntities - 1
        }

        gameStateDraft.topZIndex = absoluteNumberOfEntities;
        return absoluteNumberOfEntities;
    }

    return nextZIndex;
}