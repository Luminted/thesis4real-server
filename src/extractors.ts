import {GameState, EntityTypes} from './types/dataModelDefinitions'
//TODO: implement in a way where state does not need to be passed


export function extractClientById(state: GameState, clientId: string){
    return state.clients.find(c => c.clientInfo.clientId === clientId);
}

export function extractGrabbedEntityOfClientById(state: GameState, clientId){
    return extractClientById(state, clientId)?.grabbedEntitiy;
}

export function extractCardById(state: GameState, entityId: string){
    return state.cards.find(c => c.entityId === entityId);
}

export function extractDeckById(state: GameState, entityId: string){
    return state.decks.find(d => d.entityId === entityId);
}

export function extractEntityByTypeAndId(state: GameState, entityType: EntityTypes, entityId: string){
    if(entityType === EntityTypes.CARD){
        return extractCardById(state, entityId);
    }
    else if(entityType === EntityTypes.DECK){
        return extractDeckById(state, entityId);
    }
}