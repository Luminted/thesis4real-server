import {
  ICardEntity,
  IDeckEntity,
  IDeckCard,
  IHandCard,
  EEntityTypes,
} from "../typings";

export const cardEntityMock1: ICardEntity = {
  entityId: "card-entity-id1",
  rotation: 0,
  entityType: EEntityTypes.CARD,
  grabbedBy: null,
  positionX: 0,
  positionY: 1,
  zIndex: 0,
  faceUp: true,
  ownerDeck: null,
};

export const cardEntityMock2: ICardEntity = {
  entityId: "card-entity-id2",
  rotation: 0,
  entityType: EEntityTypes.CARD,
  grabbedBy: null,
  positionX: 0,
  positionY: 1,
  zIndex: 0,
  faceUp: true,
  ownerDeck: null,
};

export const deckCardMock: IDeckCard = {
  entityId: "deck-card-id",
};

export const handCardMock1: IHandCard = {
  entityId: "hand-card-id1",
  faceUp: true,
  ownerDeck: null,
};

export const handCardMock2: IHandCard = {
  entityId: "hand-card-id2",
  faceUp: true,
  ownerDeck: null,
};

export const deckEntityMock1: IDeckEntity = {
  entityId: "deck-entity-id1",
  rotation: 0,
  entityType: EEntityTypes.DECK,
  grabbedBy: null,
  positionX: 4,
  positionY: 16,
  zIndex: 0,
  cards: Array(52)
    .fill(deckCardMock)
    .map((card, index) => ({
      ...card,
      entityId: `${cardEntityMock1.entityId}-${index}`,
    })),
  drawIndex: 0,
  numberOfCards: 52,
};

export const deckEntityMock2: IDeckEntity = {
  entityId: "deck-entity-id2",
  rotation: 0,
  entityType: EEntityTypes.DECK,
  grabbedBy: null,
  positionX: 4,
  positionY: 16,
  zIndex: 0,
  cards: Array(52)
    .fill(deckCardMock)
    .map((card, index) => ({
      ...card,
      entityId: `${cardEntityMock1.entityId}-${index}`,
    })),
  drawIndex: 0,
  numberOfCards: 52,
};
