import {GameState, EntityTypes, ClientHand, Client, Seats} from '../types/dataModelDefinitions'

export function extractClientById(state: GameState, clientId: string){
    return state.clients.get(clientId) || null;
}

export function extractGrabbedEntityOfClientById(state: GameState, clientId){
    return extractClientById(state, clientId)?.grabbedEntitiy;
}

export function extractCardById(state: GameState, entityId: string){
    return state.cards.get(entityId) || null;
}

export function extractDeckById(state: GameState, entityId: string){
    return state.decks.get(entityId);
}

export function extractEntityByTypeAndId(state: GameState, entityType: EntityTypes, entityId: string){
    if(entityType === EntityTypes.CARD){
        return extractCardById(state, entityId);
    }
    else if(entityType === EntityTypes.DECK){
        return extractDeckById(state, entityId);
    }
}

export function extractClientHandById(state: GameState, clientId: string) {
    return state.hands.get(clientId);
}

export function extractNumberOfClients(state: GameState) : number {
    return state.clients.size;
}

export function extractCardFromClientHandById(state: GameState, clientId:string, entityId: string) {
    return state.hands.get(clientId)?.cards.find(card => card.entityId === entityId);
}

export function extractClientHandCardsById(state: GameState, clientId: string){
    return state.hands.get(clientId)?.cards || null;
}

export function extractEmptySeats(state: GameState) {
    return state.emptySeats;
}

export function extractCardFromDeckById(state: GameState, deckId: string, cardId: string){
    return state.decks.get(deckId).cards.find(card => card.entityId === cardId);
}

export function extractClientsSeatById(state: GameState, clientId: string){
    return state.clients.get(clientId)?.clientInfo.seatedAt || null;
}
