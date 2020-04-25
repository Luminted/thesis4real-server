import produce from "immer";

import { GameState, Boundary, EntityTypes } from "../../../.././types/dataModelDefinitions";
import { SharedVerb } from "../../../.././types/verbTypes";
import { extractGrabbedEntityOfClientById, extractEntityByTypeAndId, extractBoundary } from "../../../../extractors";
import { clamp } from "../../../../utils";

export function handleMove(state: GameState, verb: SharedVerb) {
    return produce(state, draft => {
        const grabbedEntity = extractGrabbedEntityOfClientById(draft, verb.clientId);
        if(grabbedEntity){
            const {entityId, entityType} = grabbedEntity
            const {positionX: positionX, positionY} = verb;
            const movedEntity = extractEntityByTypeAndId(draft, entityType, entityId);
            if(movedEntity){
                const boundary = extractBoundary(state ,entityType);
                const offsetX = positionX - grabbedEntity.grabbedAtX;
                const offsetY = positionY - grabbedEntity.grabbedAtY;
                const newPositionX = movedEntity.positionX + offsetX;
                const newPositionY = movedEntity.positionY + offsetY;
                const {height, width, scale} = movedEntity;

                if(boundary !== null){
                    const entityWidth = width * scale;
                    const entityHeight = height * scale;
                    const {top, bottom, left, right} = boundary;

                    //X axis
                    if(newPositionX < left ){
                        movedEntity.positionX = clamp(newPositionX, left, right - entityWidth);
                        //If outside boundary set grabbedAt position to the middle of entity.
                        //This compensates quick mouse movement.
                        grabbedEntity.grabbedAtX = left + Math.round(entityWidth / 2);
                    }
                    else if(newPositionX > right - entityWidth){
                        movedEntity.positionX = clamp(newPositionX, left, right - entityWidth);
                        grabbedEntity.grabbedAtX = right - Math.round(entityWidth / 2);
                    }
                    else{
                    movedEntity.positionX = newPositionX;
                    grabbedEntity.grabbedAtX = positionX;
                    }

                    //Y axis
                    if(newPositionY < top){
                        movedEntity.positionY = clamp(newPositionY, top, bottom - entityHeight);
                        //If outside boundary set grabbedAt position to the middle of entity.
                        //This compensates quick mouse movement.
                        grabbedEntity.grabbedAtY = top + Math.round(entityHeight / 2);
                    }
                    else if(newPositionY > bottom - entityHeight){
                        movedEntity.positionY = clamp(newPositionY, top, bottom - entityHeight);
                        grabbedEntity.grabbedAtY = bottom - Math.round(entityHeight / 2);
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