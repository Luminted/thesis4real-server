import produce from "immer";

import { GameState } from "../../../../../../types/dataModelDefinitions";
import { SharedVerb } from "../../../../../../types/verbTypes";
import { extractGrabbedEntityOfClientById, extractEntityByTypeAndId } from "../../../../../../extractors/gameStateExtractors";
import { clamp } from "../../../../../../utils";

export function handleMove(state: GameState, verb: SharedVerb, tableWidth: number, tableHeight: number) {
    return produce(state, draft => {
        const grabbedEntity = extractGrabbedEntityOfClientById(draft, verb.clientId);
        if(grabbedEntity){
            const {entityId, entityType} = grabbedEntity
            const {positionX: positionX, positionY} = verb;
            const movedEntity = extractEntityByTypeAndId(draft, entityType, entityId);
            if(movedEntity){
                const offsetX = positionX - grabbedEntity.grabbedAtX;
                const offsetY = positionY - grabbedEntity.grabbedAtY;
                const newPositionX = movedEntity.positionX + offsetX;
                const newPositionY = movedEntity.positionY + offsetY;
                const {height, width, scale, isBound} = movedEntity;

                if(isBound){
                    const entityWidth = width * scale;
                    const entityHeight = height * scale;

                    //X axis
                    if(newPositionX < 0 ){
                        movedEntity.positionX = clamp(newPositionX, 0, tableWidth - entityWidth);
                        //If entity outside boundary, set grabbedAt position to the middle of entity.
                        //This compensates quick mouse movement.
                        grabbedEntity.grabbedAtX = 0 + Math.round(entityWidth / 2);
                    }
                    else if(newPositionX > tableWidth - entityWidth){
                        movedEntity.positionX = clamp(newPositionX, 0, tableWidth - entityWidth);
                        grabbedEntity.grabbedAtX = tableWidth - Math.round(entityWidth / 2);
                    }
                    else{
                    movedEntity.positionX = newPositionX;
                    grabbedEntity.grabbedAtX = positionX;
                    }

                    //Y axis
                    if(newPositionY < 0){
                        movedEntity.positionY = clamp(newPositionY, 0, tableHeight - entityHeight);
                        //If entity outside boundary, set grabbedAt position to the middle of entity.
                        //This compensates quick mouse movement.
                        grabbedEntity.grabbedAtY = 0 + Math.round(entityHeight / 2);
                    }
                    else if(newPositionY > tableHeight - entityHeight){
                        movedEntity.positionY = clamp(newPositionY, 0, tableHeight - entityHeight);
                        console.log( tableHeight - Math.round(entityHeight / 2), tableHeight, entityHeight)
                        grabbedEntity.grabbedAtY = tableHeight - Math.round(entityHeight / 2);
                    }
                    else{
                    movedEntity.positionY = newPositionY;
                    grabbedEntity.grabbedAtY = positionY;
                    }
                }
                else{
                    movedEntity.positionX = newPositionX;
                    movedEntity.positionY = newPositionY;
                    grabbedEntity.grabbedAtX = positionX;
                    grabbedEntity.grabbedAtY = positionY;
                }

            }
        }
    })
}