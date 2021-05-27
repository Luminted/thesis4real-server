import { cardNotFoundMessage, clientNotFoundMessage, deckNotFoundMessage, entityNotFoundMessage, handCardNotFoundMessage, handNotFoundMessage } from "../config";
import { ExtractorError } from "../errors";
import { EEntityTypes, TGameState } from "../typings";

export const extractClientById = (state: TGameState, clientId: string) => {
  const client = state.clients.get(clientId);
  if (client) {
    return client;
  }

  throw new ExtractorError(clientNotFoundMessage);
};

export const extractGrabbedEntityOfClientById = (state: TGameState, clientId: string) => {
  return extractClientById(state, clientId).grabbedEntity;
};

export const extractCardById = (state: TGameState, entityId: string) => {
  const card = state.cards.get(entityId);
  if (card) {
    return card;
  }

  throw new ExtractorError(cardNotFoundMessage);
};

export const extractDeckById = (state: TGameState, entityId: string) => {
  const deck = state.decks.get(entityId);
  if (deck) {
    return deck;
  }

  throw new ExtractorError(deckNotFoundMessage);
};

export const extractEntityByTypeAndId = (state: TGameState, entityType: EEntityTypes, entityId: string) => {
  if (entityType === EEntityTypes.CARD) {
    return extractCardById(state, entityId);
  }
  if (entityType === EEntityTypes.DECK) {
    return extractDeckById(state, entityId);
  }
  throw new ExtractorError(entityNotFoundMessage);
};

export const extractClientHandById = (state: TGameState, clientId: string) => {
  const hand = state.hands.get(clientId);
  if (hand) {
    return hand;
  }

  throw new ExtractorError(handNotFoundMessage);
};

export const extractCardFromClientHandById = (state: TGameState, clientId: string, entityId: string) => {
  const hand = extractClientHandById(state, clientId);
  const extractedCard = hand.cards.find((card) => card.entityId === entityId);

  if (extractedCard) {
    return extractedCard;
  }

  throw new ExtractorError(handCardNotFoundMessage);
};

export const extractClientHandCardsById = (state: TGameState, clientId: string) => {
  const hand = extractClientHandById(state, clientId);
  return hand.cards;
};

export const extractClientsSeatById = (state: TGameState, clientId: string) => {
  const client = extractClientById(state, clientId);
  return client.clientInfo.seatId;
};
