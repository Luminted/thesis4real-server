import {produce} from 'immer';

import {GameState, EntityTypes} from '../../common/dataModelDefinitions'
import {SharedVerbTypes, VerbTypes, Verb, CardVerbTypes} from "../../common/verbTypes";
import {extractGrabbedEntityOfClientById, extractClientById} from './extractors';
import { MaybeUndefined } from '../../common/genericTypes';

export function handleVerbs(state: GameState, verb: Verb){
    return handleCardVerbs(state, verb) || handleDeckVerbs(state, verb) || handleSharedVerbs(state, verb) || state;
}

export function handleSharedVerbs (state: GameState , verb: Verb): MaybeUndefined<GameState>{
    // debugger
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
