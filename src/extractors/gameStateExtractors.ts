import { TGameState, EEntityTypes } from "../typings";

export const extractClientById = (state: TGameState, clientId: string) => {
  const client = state.clients.get(clientId);
  if (client) {
    return client;
  }

  throw new Error("Client with given id not found");
};

export const extractGrabbedEntityOfClientById = (state: TGameState, clientId) => {
  return extractClientById(state, clientId).grabbedEntity;
};

export const extractCardById = (state: TGameState, entityId: string) => {
  const card = state.cards.get(entityId);
  if (card) {
    return card;
  }

  throw new Error("Card with given id not found");
};

export const extractDeckById = (state: TGameState, entityId: string) => {
  const deck = state.decks.get(entityId);
  if (deck) {
    return deck;
  }

  throw new Error("Deck with given id not found");
};

export const extractEntityByTypeAndId = (state: TGameState, entityType: EEntityTypes, entityId: string) => {
  if (entityType === EEntityTypes.CARD) {
    return extractCardById(state, entityId);
  }
  if (entityType === EEntityTypes.DECK) {
    return extractDeckById(state, entityId);
  }
  throw new Error("Entity not found");
};

export const extractClientHandById = (state: TGameState, clientId: string) => {
  const hand = state.hands.get(clientId);
  if (hand) {
    return hand;
  }

  throw new Error("Hand not found for given client");
};

export const extractCardFromClientHandById = (state: TGameState, clientId: string, entityId: string) => {
  const hand = extractClientHandById(state, clientId);
  const extractedCard = hand.cards.find((card) => card.entityId === entityId);

  if (extractedCard) {
    return extractedCard;
  }

  throw new Error("Card not found in given hand");
};

export const extractClientHandCardsById = (state: TGameState, clientId: string) => {
  const hand = extractClientHandById(state, clientId);
  return hand.cards;
};

export const extractClientsSeatById = (state: TGameState, clientId: string) => {
  const client = extractClientById(state, clientId);
  return client.clientInfo.seatId;
};
