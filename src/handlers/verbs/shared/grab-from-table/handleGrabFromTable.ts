import produce from "immer";

import { GameState } from "../../../../types/dataModelDefinitions";
import { SharedVerb } from "../../../../types/verbTypes";
import { extractClientById, extractEntityByTypeAndId } from "../../../../extractors/gameStateExtractors";

export function handleGrab(state: GameState, verb: SharedVerb) {
    return produce(state, draft => {
        const {positionX: positionX, positionY, entityId, entityType} = verb;
        const entity = extractEntityByTypeAndId(draft, entityType, entityId);
        if(!entity.grabLocked){
            extractClientById(draft, verb.clientId).grabbedEntitiy = {
                entityId,
                entityType,
                grabbedAtX: positionX,
                grabbedAtY: positionY
            }
            entity.grabLocked = true;
        }
    })
}