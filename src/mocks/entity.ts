import { CardEntity, CardTypes, DeckEntity, CardRepresentation, EntityTypes } from "../types/dataModelDefinitions";

export const cardEntityMock: CardEntity = {
    entityId: 'card-entity-id',
    rotation: 0,
    entityType: EntityTypes.CARD,
    grabbedBy: null,
    height: 10,
    width: 11,
    positionX: 0,
    positionY: 1,
    zIndex: 0,
    isBound: false,
    cardType: CardTypes.FRENCH,
    face: "mock",
    faceUp: true,
    ownerDeck: null
}

export const cardRepresentationMock: CardRepresentation = {
    entityId: 'card-entity-id',
    cardType: CardTypes.FRENCH,
    entityType: EntityTypes.CARD,
    face: 'mock',
    faceUp: false,
    ownerDeck: null
}

export const deckEntityMock: DeckEntity = {
    entityId: 'deck-entity-id',
    rotation: 0,
    entityType: EntityTypes.DECK,
    grabbedBy: null,
    height: 10,
    width: 11,
    positionX: 0,
    positionY: 1,
    zIndex: 0,
    isBound: false,
    cards: Array(52).fill(cardRepresentationMock).map((card, index) => ({...card, entityId: `${cardEntityMock.entityId}-${index}`})),
    drawIndex: 0,
}