import {produce} from 'immer';

import {GameState} from '../../common/dataModelDefinitions'
import {SharedVerbTypes, VerbTypes, Verb, VerbClasses, CardVerbTypes} from "../../common/verbTypes";
import {extractGrabbedEntityOfClientById, extractClientById} from './extractors';

export function handleVerbs(state: GameState, verb: Verb){
    switch(verb.class) {
        case VerbClasses.SHARED:
            return handleSharedVerbs(state, verb);
        case VerbClasses.CARD:
            return handleCardVerbs(state, verb);
        case VerbClasses.DECK:
            return handleDeckVerbs(state, verb);
        }
}

export function handleSharedVerbs (state: GameState , verb: Verb){
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
            return state;
    }
}

export function handleCardVerbs(state: GameState , verb: Verb){
    switch(verb.type){
        default:
            return state;
    }
}

export function handleDeckVerbs (state: GameState , verb: Verb){
    switch(verb.type){
        default:
            return state;
    }
}
