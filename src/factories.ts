import uuidv4 from 'uuid/v4';

import { CardEntity, DeckEntity, EntityTypes, DeckCard, ClientHand, HandCard} from './types/dataModelDefinitions';

export const createCardEntity = (positionX: number,
     positionY: number,
     width: number,
     height: number,
     faceUp: boolean,
     entityId: string,
     ownerDeck: string,
     zIndex: number,
     isBound:boolean,
     rotation: number,
     grabbedBy: string,
     metadata: object): CardEntity => (
    {
        positionX,
        positionY,
        ownerDeck,
        rotation,
        faceUp,
        width,
        height,
        entityId,
        zIndex,
        isBound,
        grabbedBy,
        metadata,
        entityType: EntityTypes.CARD,
})

export const createHandCardFromEntity = (cardEntity: CardEntity): HandCard => ({
    entityId: cardEntity.entityId,
    faceUp: cardEntity.faceUp,
    width: cardEntity.width,
    height: cardEntity.height,
    isBound: cardEntity.isBound,
    ownerDeck: cardEntity.ownerDeck,
    revealed: false,
    metadata: cardEntity.metadata
})

export const createDeckEntity = (positionX: number, positionY: number, width: number, height:number, zIndex: number, entityId: string, isBound: boolean, rotation: number, grabbedBy: string, metadataArray: object[]): DeckEntity => ({
    positionX,
    positionY,
    rotation,
    entityId,
    width,
    height,
    grabbedBy,
    zIndex,
    isBound,
    entityType: EntityTypes.DECK,
    drawIndex: 0,
    //TODO: make isBound dynamic
    cards: metadataArray.map(metadata => ({metadata, faceUp: false, isBound: false, revealed: false, entityId: uuidv4()}))
})

export const createClientHand = (clientId: string): ClientHand => ({
    clientId,
    cards: [],
})