import {GameState} from '../../common/dataModelDefinitions'

export function extractClientById(state: GameState, clientId: string){
    return state.clients.find(c => c.clientInfo.clientId === clientId);
}

export function extractGrabbedEntityOfClientById(state: GameState, clientId){
    return extractClientById(state, clientId)?.grabbedEntitiy;
}

export function extractCardById(state: GameState, entityId: string){
    return state.cards.find(c => c.entityId === entityId);
}