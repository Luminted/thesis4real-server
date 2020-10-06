import { CardEntity, DeckEntity, DeckCard, HandCard, EntityTypes } from "../types/dataModelDefinitions";

export const cardEntityMock1: CardEntity = {
    entityId: 'card-entity-id1',
    rotation: 0,
    entityType: EntityTypes.CARD,
    grabbedBy: null,
    positionX: 0,
    positionY: 1,
    zIndex: 0,
    faceUp: true,
    ownerDeck: null
}

export const cardEntityMock2: CardEntity = {
    entityId: 'card-entity-id2',
    rotation: 0,
    entityType: EntityTypes.CARD,
    grabbedBy: null,
    positionX: 0,
    positionY: 1,
    zIndex: 0,
    faceUp: true,
    ownerDeck: null
}

export const deckCardMock: DeckCard = {
    entityId: 'deck-card-id',
    faceUp: false,
    revealed: false,
}

export const handCardMock1: HandCard = {
    entityId: 'hand-card-id1',
    faceUp: true,
    ownerDeck: null,
    revealed: false,
}

export const handCardMock2: HandCard = {
    entityId: 'hand-card-id2',
    faceUp: true,
    ownerDeck: null,
    revealed: false,
}

export const deckEntityMock1: DeckEntity = {
    entityId: 'deck-entity-id1',
    rotation: 0,
    entityType: EntityTypes.DECK,
    grabbedBy: null,
    positionX: 4,
    positionY: 16,
    zIndex: 0,
    cards: Array(52).fill(deckCardMock).map((card, index) => ({...card, entityId: `${cardEntityMock1.entityId}-${index}`})),
    drawIndex: 0,
}

export const deckEntityMock2: DeckEntity = {
    entityId: 'deck-entity-id2',
    rotation: 0,
    entityType: EntityTypes.DECK,
    grabbedBy: null,
    positionX: 4,
    positionY: 16,
    zIndex: 0,
    cards: Array(52).fill(deckCardMock).map((card, index) => ({...card, entityId: `${cardEntityMock1.entityId}-${index}`})),
    drawIndex: 0,
}
