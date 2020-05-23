import produce from "immer";

import { GameState, EntityTypes } from "../../../../../../types/dataModelDefinitions";
import { SharedVerb } from "../../../../../../types/verbTypes";

export function handleRemove(state: GameState, verb: SharedVerb): GameState {
    return produce(state, draft => {
        const {entityType, entityId} = verb;
        if(entityType === EntityTypes.CARD){
            draft.cards.delete(entityId);
        }
        else if(entityType === EntityTypes.DECK){
            draft.decks.delete
        }
    })
}