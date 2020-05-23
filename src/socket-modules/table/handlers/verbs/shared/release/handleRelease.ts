import produce from "immer"

import { GameState } from "../../../../../../types/dataModelDefinitions"
import { SharedVerb } from "../../../../../../types/verbTypes"
import { extractClientById, extractEntityByTypeAndId } from "../../../../../../extractors/gameStateExtractors"

export function handleRelease(state: GameState, verb: SharedVerb) {
    return produce(state, draft => {
        const {entityType, entityId} = verb;
        extractClientById(draft, verb.clientId).grabbedEntitiy = null;
        extractEntityByTypeAndId(draft, entityType, entityId).grabbedBy = null;
    })  
}