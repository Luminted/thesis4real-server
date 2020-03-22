import {produce} from 'immer';

import {EntityTypes, GameState, CardDataModel} from './types/dataModelDefinitions'
import {MouseInput, MouseInputTypes} from './types/mouseEventTypes';
import {extractGrabbedEntityOfClientById, extractClientById} from './extractors';

export function handleMouseInput(state: GameState, input: MouseInput){
    switch(input.type){
        case MouseInputTypes.LEFT_BUTTON_DOWN:
            return handleLeftMouseDown(state, input);
        case MouseInputTypes.LEFT_BUTTON_UP:
            return handleLeftMouseUp(state, input);
        case MouseInputTypes.MOUSE_MOVE:
            return handleMouseMove(state, input);
        default:
            return state;
    }
}

export function handleLeftMouseDown(state: GameState , input: MouseInput){
    switch(input.entityType){
        case EntityTypes.CARD:
            const {cursorX, cursorY, entityId, entityType} = input;
            return produce(state, draft => {
                extractClientById(draft, input.clientId).grabbedEntitiy = {
                    entityId,
                    entityType,
                    grabbedAtX: cursorX,
                    grabbedAtY: cursorY
                }
            })
        default:
            return state;
    }
}

export function handleLeftMouseUp(state: GameState, input: MouseInput) {
    return produce(state, draft => {
        extractClientById(draft, input.clientId).grabbedEntitiy = null
    })
}

export function handleMouseMove(state: GameState, input: MouseInput){
    return produce(state, draft => {
        const grabbedEntity = extractGrabbedEntityOfClientById(draft, input.clientId);
        if(grabbedEntity){
            const {cursorX, cursorY} = input;
            let movedCard = draft.cards.find(card => card.entityId === grabbedEntity.entityId);
            if(movedCard){
                const offsetX = cursorX - grabbedEntity.grabbedAtX;
                const offsetY = cursorY - grabbedEntity.grabbedAtY;
                
                movedCard.positionX = movedCard.positionX + offsetX;
                movedCard.positionY = movedCard.positionY + offsetY;
                grabbedEntity.grabbedAtX = cursorX;
                grabbedEntity.grabbedAtY = cursorY;
            }
        }
    })
}