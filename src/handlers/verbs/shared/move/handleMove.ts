import produce from "immer";

import { GameState } from "../../../.././types/dataModelDefinitions";
import { SharedVerb } from "../../../.././types/verbTypes";
import { extractGrabbedEntityOfClientById, extractEntityByTypeAndId } from "../../../../extractors";

export function handleMove(state: GameState, verb: SharedVerb) {
    return produce(state, draft => {
        const grabbedEntity = extractGrabbedEntityOfClientById(draft, verb.clientId);
        if(grabbedEntity){
            const {entityId, entityType} = grabbedEntity
            const {positionX: positionX, positionY} = verb;
            let movedEntity = extractEntityByTypeAndId(draft, entityType, entityId);
            if(movedEntity){
                const offsetX = positionX - grabbedEntity.grabbedAtX;
                const offsetY = positionY - grabbedEntity.grabbedAtY;
                
                movedEntity.positionX = movedEntity.positionX + offsetX;
                movedEntity.positionY = movedEntity.positionY + offsetY;
                grabbedEntity.grabbedAtX = positionX;
                grabbedEntity.grabbedAtY = positionY;
            }
        }
    })
}