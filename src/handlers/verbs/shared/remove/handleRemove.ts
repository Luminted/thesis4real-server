import produce from "immer";

import { GameState, EntityTypes } from "../../../.././types/dataModelDefinitions";
import { SharedVerb } from "../../../.././types/verbTypes";

export function handleRemove(state: GameState, verb: SharedVerb): GameState {
    return produce(state, draft => {
        const {entityType, entityId} = verb;
        if(entityType === EntityTypes.CARD){
            draft.cards = state.cards.filter(card => card.entityId !== entityId);
        }
        else if(entityType === EntityTypes.DECK){
            let filtered =  state.decks.filter(deck =>{
                return deck.entityId !== entityId;
            } )
            draft.decks =filtered
        }
    })
}