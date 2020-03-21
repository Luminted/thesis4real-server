import produce from "immer";

import { GameState } from "../../../../../../common/dataModelDefinitions";
import { SharedVerb } from "../../../../../../common/verbTypes";
import { extractGrabbedEntityOfClientById, extractEntityByTypeAndId } from "../../../../extractors";

export function handleMove(state: GameState, verb: SharedVerb) {
    return produce(state, draft => {
        const grabbedEntity = extractGrabbedEntityOfClientById(draft, verb.clientId);
        if(grabbedEntity){
            const {entityId, entityType} = grabbedEntity
            const {cursorX, cursorY} = verb;
            let movedEntity = extractEntityByTypeAndId(draft, entityType, entityId);
            if(movedEntity){
                const offsetX = cursorX - grabbedEntity.grabbedAtX;
                const offsetY = cursorY - grabbedEntity.grabbedAtY;
                
                movedEntity.positionX = movedEntity.positionX + offsetX;
                movedEntity.positionY = movedEntity.positionY + offsetY;
                grabbedEntity.grabbedAtX = cursorX;
                grabbedEntity.grabbedAtY = cursorY;
            }
        }
    })
}