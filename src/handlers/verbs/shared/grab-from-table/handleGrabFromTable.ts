import produce from "immer";

import { GameState } from "../../../../types/dataModelDefinitions";
import { SharedVerb } from "../../../../types/verbTypes";
import { extractClientById, extractEntityByTypeAndId } from "../../../../extractors/gameStateExtractors";

export function handleGrab(state: GameState, verb: SharedVerb) {
    return produce(state, draft => {
        const {positionX, positionY, entityId, entityType, clientId} = verb;
        const entity = extractEntityByTypeAndId(draft, entityType, entityId);
        if(entity.grabbedBy === null){
            extractClientById(draft, verb.clientId).grabbedEntitiy = {
                entityId,
                entityType,
                grabbedAtX: positionX,
                grabbedAtY: positionY
            }
            entity.grabbedBy = clientId;
        }
    })
}