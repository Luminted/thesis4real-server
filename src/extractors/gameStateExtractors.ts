import {TGameState, EEntityTypes} from '../typings'

export const extractClientById = (state: TGameState, clientId: string)=> {
    return state.clients.get(clientId) || null;
}

export const extractGrabbedEntityOfClientById = (state: TGameState, clientId)=> {
    return extractClientById(state, clientId)?.grabbedEntity;
}

export const extractCardById = (state: TGameState, entityId: string)=> {
    return state.cards.get(entityId) || null;
}

export const extractDeckById = (state: TGameState, entityId: string)=> {
    return state.decks.get(entityId);
}

export const extractEntityByTypeAndId = (state: TGameState, entityType: EEntityTypes, entityId: string)=> {
    if(entityType === EEntityTypes.CARD){
        return extractCardById(state, entityId);
    }
    else if(entityType === EEntityTypes.DECK){
        return extractDeckById(state, entityId);
    }
}

export const extractClientHandById = (state: TGameState, clientId: string) => {
    return state.hands.get(clientId);
}

export const extractNumberOfClients = (state: TGameState) : number => {
    return state.clients.size;
}

export const extractCardFromClientHandById = (state: TGameState, clientId:string, entityId: string) => {
    return state.hands.get(clientId)?.cards.find(card => card.entityId === entityId);
}

export const extractClientHandCardsById = (state: TGameState, clientId: string)=> {
    return state.hands.get(clientId)?.cards || null;
}

export const extractCardFromDeckById = (state: TGameState, deckId: string, cardId: string)=> {
    return state.decks.get(deckId).cards.find(card => card.entityId === cardId);
}

export const extractClientsSeatById = (state: TGameState, clientId: string)=> {
    return state.clients.get(clientId)?.clientInfo.seatId || null;
}
