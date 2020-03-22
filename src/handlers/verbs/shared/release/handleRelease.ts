import produce from "immer"

import { GameState } from "../../../.././types/dataModelDefinitions"
import { SharedVerb } from "../../../.././types/verbTypes"
import { extractClientById } from "../../../../extractors"

export function handleRelease(state: GameState, verb: SharedVerb) {
    return produce(state, draft => {
        extractClientById(draft, verb.clientId).grabbedEntitiy = null
    })  
}