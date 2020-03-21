import {produce} from 'immer';

import {GameState, EntityTypes} from '../../common/dataModelDefinitions'
import {SharedVerbTypes, VerbTypes, Verb, CardVerbTypes} from "../../common/verbTypes";
import {extractGrabbedEntityOfClientById, extractClientById, extractEntityByTypeAndId} from './extractors';
import { MaybeUndefined } from '../../common/genericTypes';

export function handleVerb(state: GameState, verb: Verb){
    switch(verb.type){
        case SharedVerbTypes.GRAB:
            return handleGrab(state, verb);
        case SharedVerbTypes.RELEASE:
            return handleRelease(state, verb);
        case SharedVerbTypes.MOVE:
            return handleMove(state, verb);
        default:
            return state;
    }
}

export function handleGrab(state: GameState, verb: Verb) {
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

export function handleMove(state: GameState, verb: Verb) {
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

export function handleRelease(state: GameState, verb: Verb) {
    return produce(state, draft => {
        extractClientById(draft, verb.clientId).grabbedEntitiy = null
    })  
}

export function handleSharedVerbs (state: GameState , verb: Verb): MaybeUndefined<GameState>{
    console.log('received ',verb.type,'matched against', SharedVerbTypes.GRAB)
    console.log(verb.type == SharedVerbTypes.GRAB, '======')
    switch(verb.type){
        case SharedVerbTypes.GRAB:
            const {cursorX, cursorY, entityId, entityType} = verb;
            return produce(state, draft => {
                extractClientById(draft, verb.clientId).grabbedEntitiy = {
                    entityId,
                    entityType,
                    grabbedAtX: cursorX,
                    grabbedAtY: cursorY
                }
            })
        
        case SharedVerbTypes.MOVE:
            return produce(state, draft => {
                const grabbedEntity = extractGrabbedEntityOfClientById(draft, verb.clientId);
                if(grabbedEntity){
                    const {cursorX, cursorY} = verb;
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

        case SharedVerbTypes.RELEASE:
            return produce(state, draft => {
                extractClientById(draft, verb.clientId).grabbedEntitiy = null
            })

        default:
            return undefined;
    }
}

export function handleCardVerbs(state: GameState , verb: Verb): MaybeUndefined<GameState>{
    switch(verb.type){
        default:
            return undefined;
    }
}

export function handleDeckVerbs (state: GameState , verb: Verb): MaybeUndefined<GameState>{
    switch(verb.type){
        default:
            return undefined;
    }
}
