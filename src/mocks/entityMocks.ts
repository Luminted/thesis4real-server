import { CardEntity, DeckEntity, DeckCard, HandCard, EntityTypes } from "../types/dataModelDefinitions";

export const cardEntityMock1: CardEntity = {
    entityId: 'card-entity-id1',
    rotation: 0,
    entityType: EntityTypes.CARD,
    grabbedBy: null,
    height: 10,
    width: 11,
    positionX: 0,
    positionY: 1,
    zIndex: 0,
    isBound: false,
    faceUp: true,
    ownerDeck: null
}

export const cardEntityMock2: CardEntity = {
    entityId: 'card-entity-id2',
    rotation: 0,
    entityType: EntityTypes.CARD,
    grabbedBy: null,
    height: 10,
    width: 11,
    positionX: 0,
    positionY: 1,
    zIndex: 0,
    isBound: false,
    faceUp: true,
    ownerDeck: null
}

export const deckCardMock: DeckCard = {
    entityId: 'deck-card-id',
    faceUp: false,
    revealed: false,
    isBound: false,
}

export const handCardMock1: HandCard = {
    entityId: 'hand-card-id1',
    faceUp: true,
    height: 10,
    width: 5,
    ownerDeck: null,
    revealed: false,
    isBound: false,
}

export const handCardMock2: HandCard = {
    entityId: 'hand-card-id2',
    faceUp: true,
    height: 10,
    width: 5,
    ownerDeck: null,
    revealed: false,
    isBound: false
}

export const deckEntityMock1: DeckEntity = {
    entityId: 'deck-entity-id1',
    rotation: 0,
    entityType: EntityTypes.DECK,
    grabbedBy: null,
    height: 10,
    width: 11,
    positionX: 4,
    positionY: 16,
    zIndex: 0,
    isBound: false,
    cards: Array(52).fill(deckCardMock).map((card, index) => ({...card, entityId: `${cardEntityMock1.entityId}-${index}`})),
    drawIndex: 0,
}

export const deckEntityMock2: DeckEntity = {
    entityId: 'deck-entity-id2',
    rotation: 0,
    entityType: EntityTypes.DECK,
    grabbedBy: null,
    height: 10,
    width: 11,
    positionX: 4,
    positionY: 16,
    zIndex: 0,
    isBound: false,
    cards: Array(52).fill(deckCardMock).map((card, index) => ({...card, entityId: `${cardEntityMock1.entityId}-${index}`})),
    drawIndex: 0,
}
