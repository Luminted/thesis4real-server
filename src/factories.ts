import uuidv4 from 'uuid/v4';

import { CardEntity, DeckEntity, EntityTypes, ClientHand, HandCard} from './types/dataModelDefinitions';


// TODO: move these functions into handler classes
export const createCardEntity = (positionX: number,
     positionY: number,
     faceUp: boolean,
     entityId: string,
     ownerDeck: string,
     zIndex: number,
     rotation: number,
     grabbedBy: string,
     metadata: object): CardEntity => (
    {
        positionX,
        positionY,
        ownerDeck,
        rotation,
        faceUp,
        entityId,
        zIndex,
        grabbedBy,
        metadata,
        entityType: EntityTypes.CARD,
})

export const createHandCard = (entityId, faceUp, ownerDeck, metadata) => ({
    entityId,
    faceUp,
    ownerDeck,
    metadata
})

export const createDeckEntity = (positionX: number, positionY: number, zIndex: number, entityId: string, rotation: number, grabbedBy: string, metadata: object, cardsMetadata: object[] = []): DeckEntity => ({
    positionX,
    positionY,
    rotation,
    entityId,
    grabbedBy,
    zIndex,
    metadata,
    entityType: EntityTypes.DECK,
    drawIndex: 0,
    cards: cardsMetadata.map(metadata => ({ metadata, entityId: uuidv4()}))
})

export const createClientHand = (clientId: string): ClientHand => ({
    clientId,
    cards: [],
    ordering: []
})