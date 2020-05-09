import {GameState, EntityTypes, ClientHand, Client, Directions} from '../types/dataModelDefinitions'
import {ServerState} from '../state'

export function extractClientById(state: GameState, clientId: string){
    return state.clients.get(clientId);
}

export function extractGrabbedEntityOfClientById(state: GameState, clientId){
    return extractClientById(state, clientId)?.grabbedEntitiy;
}

export function extractCardById(state: GameState, entityId: string){
    return state.cards.get(entityId);
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

export function extractDirections(state: ServerState): Directions[] {
    return state.directions;
}

export function extractCardFromClientHandById(state: GameState, clientId:string, entityId: string) {
    return state.hands.get(clientId)?.cards.find(card => card.entityId === entityId);
}

export function extractBoundary(state: GameState, entityType) {
    if(entityType === EntityTypes.CARD){
        return state.cardBoundary;
    }
    else if(entityType === EntityTypes.DECK){
        return state.deckBoundary;
    }
    else {
        return null;
    }
}

export function extractEmptySeats(state: GameState) {
    return state.emptySeats;
}

export function extractCardFromDeckById(state: GameState, deckId: string, cardId: string){
    return state.decks.get(deckId).cards.find(card => card.entityId === cardId);
}