import { VerbError } from '../error/VerbError';
import {TGameState, EEntityTypes} from '../typings'

export const extractClientById = (state: TGameState, clientId: string)=> {
    const client = state.clients.get(clientId);
    if(client){
        return client;
    }
    else{
        throw new VerbError("Client with given id not found");
    }
}

export const extractGrabbedEntityOfClientById = (state: TGameState, clientId)=> {
  return extractClientById(state, clientId).grabbedEntity;
}

export const extractCardById = (state: TGameState, entityId: string)=> {
    const card = state.cards.get(entityId);
    if(card){
        return card;
    }
    else{
        throw new VerbError("Card with given id not found");
    }
}

export const extractDeckById = (state: TGameState, entityId: string)=> {
    const deck = state.decks.get(entityId);
    if(deck){
        return deck;
    }
    else{
        throw new VerbError("Deck with given id not found");
    }
}

export const extractEntityByTypeAndId = (state: TGameState, entityType: EEntityTypes, entityId: string)=> {
    if(entityType === EEntityTypes.CARD){
        return extractCardById(state, entityId);
    }
    else if(entityType === EEntityTypes.DECK){
        return extractDeckById(state, entityId);
    }
    else{
        throw new VerbError("Entity not found");
    }
}

export const extractClientHandById = (state: TGameState, clientId: string) => {
    const hand = state.hands.get(clientId);
    if(hand){
        return hand;
    }
    else{
        throw new VerbError("Hand not found for given client");
    }
}

export const extractCardFromClientHandById = (state: TGameState, clientId:string, entityId: string) => {
    const hand = extractClientHandById(state, clientId);
    const card = hand.cards.find(card => card.entityId === entityId);

    if(card){
        return card;
    }
    else{
        throw new VerbError("Card not found in given hand");
    }
}

export const extractClientHandCardsById = (state: TGameState, clientId: string)=> {
    const hand = extractClientHandById(state, clientId);
    return hand.cards;
}

export const extractClientsSeatById = (state: TGameState, clientId: string)=> {
    const client = extractClientById(state, clientId);
    return client.clientInfo.seatId;
}
