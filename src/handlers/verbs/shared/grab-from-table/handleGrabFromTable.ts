import produce from "immer";

import { GameState } from "../../../../types/dataModelDefinitions";
import { SharedVerb } from "../../../../types/verbTypes";
import { extractClientById, extractEntityByTypeAndId } from "../../../../extractors/gameStateExtractors";

export function handleGrab(state: GameState, verb: SharedVerb) {
    const {positionX: positionX, positionY, entityId, entityType} = verb;
    return produce(state, draft => {
        const {entityType, entityId} = verb;
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