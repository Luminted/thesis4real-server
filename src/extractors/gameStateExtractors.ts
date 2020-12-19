import { cardNotFoundMessage, clientNotFoundMessage, deckNotFoundMessage, entityNotFoundMessage, handCardNotFoundMessage, handNotFoundMessage } from "../config";
import { EEntityTypes, TGameState } from "../typings";

export const extractClientById = (state: TGameState, clientId: string) => {
  const client = state.clients.get(clientId);
  if (client) {
    return client;
  }

  throw new Error(clientNotFoundMessage);
};

export const extractGrabbedEntityOfClientById = (state: TGameState, clientId) => {
  return extractClientById(state, clientId).grabbedEntity;
};

export const extractCardById = (state: TGameState, entityId: string) => {
  const card = state.cards.get(entityId);
  if (card) {
    return card;
  }

  throw new Error(cardNotFoundMessage);
};

export const extractDeckById = (state: TGameState, entityId: string) => {
  const deck = state.decks.get(entityId);
  if (deck) {
    return deck;
  }

  throw new Error(deckNotFoundMessage);
};

export const extractEntityByTypeAndId = (state: TGameState, entityType: EEntityTypes, entityId: string) => {
  if (entityType === EEntityTypes.CARD) {
    return extractCardById(state, entityId);
  }
  if (entityType === EEntityTypes.DECK) {
    return extractDeckById(state, entityId);
  }
  throw new Error(entityNotFoundMessage);
};

export const extractClientHandById = (state: TGameState, clientId: string) => {
  const hand = state.hands.get(clientId);
  if (hand) {
    return hand;
  }

  throw new Error(handNotFoundMessage);
};

export const extractCardFromClientHandById = (state: TGameState, clientId: string, entityId: string) => {
  const hand = extractClientHandById(state, clientId);
  const extractedCard = hand.cards.find((card) => card.entityId === entityId);

  if (extractedCard) {
    return extractedCard;
  }

  throw new Error(handCardNotFoundMessage);
};

export const extractClientHandCardsById = (state: TGameState, clientId: string) => {
  const hand = extractClientHandById(state, clientId);
  return hand.cards;
};

export const extractClientsSeatById = (state: TGameState, clientId: string) => {
  const client = extractClientById(state, clientId);
  return client.clientInfo.seatId;
};
