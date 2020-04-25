import {GameState, EntityTypes, ClientHand, Client, Directions} from './types/dataModelDefinitions'
import { MaybeUndefined } from './types/genericTypes';
import {ServerState} from './state'
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

export function extractClientHandById(state: GameState, clientId: string): MaybeUndefined<ClientHand> {
    return state.hands.find(hand => hand.clientId === clientId);
}

export function extractClientBySocketId(state: GameState, socketId: string): MaybeUndefined<Client> {
    return state.clients.find(client => client.socketId === socketId);
}

export function extractNumberOfClients(state: GameState) : number {
    return state.clients.length;
}

export function extractDirections(state: ServerState): Directions[] {
    return state.directions;
}

export function extractCardFromClientHandById(state: GameState, clientId:string, entityId: string) {
    return state.hands.find(hand => hand.clientId === clientId)?.cards.find(card => card.entityId === entityId);
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