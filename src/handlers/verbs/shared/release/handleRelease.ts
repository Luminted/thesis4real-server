import produce from "immer"

import { GameState } from "../../../../../../common/dataModelDefinitions"
import { SharedVerb } from "../../../../../../common/verbTypes"
import { extractClientById } from "../../../../extractors"

export function handleRelease(state: GameState, verb: SharedVerb) {
    return produce(state, draft => {
        extractClientById(draft, verb.clientId).grabbedEntitiy = null
    })  
}