import produce from "immer";

import { GameState } from "../../../.././types/dataModelDefinitions";
import { SharedVerb } from "../../../.././types/verbTypes";
import { extractClientById } from "../../../../extractors";

export function handleGrab(state: GameState, verb: SharedVerb) {
    const {cursorX, cursorY, entityId, entityType} = verb;
    return produce(state, draft => {
        extractClientById(draft, verb.clientId).grabbedEntitiy = {
            entityId,
            entityType,
            grabbedAtX: cursorX,
            grabbedAtY: cursorY
        }
    })
}