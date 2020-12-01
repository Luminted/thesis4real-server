import {GameState, EntityTypes} from '../types/dataModelDefinitions'

export const extractClientById = (state: GameState, clientId: string)=> {
    return state.clients.get(clientId) || null;
}

export const extractGrabbedEntityOfClientById = (state: GameState, clientId)=> {
    return extractClientById(state, clientId)?.grabbedEntity;
}

export const extractCardById = (state: GameState, entityId: string)=> {
    return state.cards.get(entityId) || null;
}

export const extractDeckById = (state: GameState, entityId: string)=> {
    return state.decks.get(entityId);
}

export const extractEntityByTypeAndId = (state: GameState, entityType: EntityTypes, entityId: string)=> {
    if(entityType === EntityTypes.CARD){
        return extractCardById(state, entityId);
    }
    else if(entityType === EntityTypes.DECK){
        return extractDeckById(state, entityId);
    }
}

export const extractClientHandById = (state: GameState, clientId: string) => {
    return state.hands.get(clientId);
}

export const extractNumberOfClients = (state: GameState) : number => {
    return state.clients.size;
}

export const extractCardFromClientHandById = (state: GameState, clientId:string, entityId: string) => {
    return state.hands.get(clientId)?.cards.find(card => card.entityId === entityId);
}

export const extractClientHandCardsById = (state: GameState, clientId: string)=> {
    return state.hands.get(clientId)?.cards || null;
}

export const extractCardFromDeckById = (state: GameState, deckId: string, cardId: string)=> {
    return state.decks.get(deckId).cards.find(card => card.entityId === cardId);
}

export const extractClientsSeatById = (state: GameState, clientId: string)=> {
    return state.clients.get(clientId)?.clientInfo.seatId || null;
}
