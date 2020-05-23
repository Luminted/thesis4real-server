import uuidv4 from 'uuid/v4';

import {Client, CardEntity, DeckEntity, EntityTypes, CardRepresentation, ClientHand, Seats, CardTypes} from './types/dataModelDefinitions';
import {cardConfigLookup, gameConfig} from './config';
import { ClientConnectionStatuses } from './types/socketTypes';

export function clientFactory(clientId?: string, seatedAt?: Seats): Client {
    return {
        clientInfo:{
            clientId: clientId || uuidv4(),
            seatedAt: seatedAt || null
        },
        status: ClientConnectionStatuses.CONNECTED,
        grabbedEntitiy: null
    }
}

export function cardFactoryFromObject(constructorObject: {positionX: number, positionY: number, cardType: CardTypes, face?: string, turnedUp?: boolean, entityId?: string, ownerDeck?: string, scale?: number, grabbedBy?: string, zIndex?: number, isBound?: boolean}): CardEntity {
    const {cardType, ownerDeck, positionX, positionY, turnedUp, entityId, face, grabbedBy, scale, zIndex, isBound} = constructorObject;
    let cardConfig = cardConfigLookup[cardType];
    let card: CardEntity =  {
        face,
        cardType,
        entityId: entityId || uuidv4(),
        entityType: EntityTypes.CARD,
        width: cardConfig.baseWidth,
        height: cardConfig.baseHeight,
        scale: scale || gameConfig.cardScale,
        positionX,
        positionY,
        faceUp: turnedUp !== undefined ? turnedUp : true,
        ownerDeck,
        grabbedBy: grabbedBy || null,
        zIndex: zIndex || 0,
        isBound: isBound || false
    }
    return card;
}

export function cardFactory(positionX: number, positionY: number, cardType: CardTypes, face?: string, turnedUp: boolean = true, entityId?: string, ownerDeck: string = null, scale?: number, grabbedBy?: string, zIndex?: number, isBound?:boolean): CardEntity {
    let cardConfig = cardConfigLookup[cardType];
    let card: CardEntity =  {
        face,
        cardType,
        entityId: entityId || uuidv4(),
        entityType: EntityTypes.CARD,
        width: cardConfig.baseWidth,
        height: cardConfig.baseHeight,
        scale: scale || gameConfig.cardScale,
        positionX,
        positionY,
        faceUp: turnedUp,
        ownerDeck,
        grabbedBy: grabbedBy || null,
        zIndex: zIndex || 0,
        isBound: isBound || false
    }
    return card;
}

export function cardRepFactory(cardType: CardTypes, face: string, entityId?: string, ownerDeck?: string, faceUp?: boolean): CardRepresentation {
    return {
        cardType,
        entityId: entityId || uuidv4(),
        entityType: EntityTypes.CARD,
        face,
        ownerDeck: ownerDeck || null,
        faceUp: faceUp || true
    }
}

export function createCardRepresentationFromCardEntity(card: CardEntity): CardRepresentation{
    return {
        entityId: card.entityId,
        cardType: card.cardType,
        entityType: card.entityType,
        face: card.face,
        faceUp: card.faceUp,
        ownerDeck: card.ownerDeck
    }
}

export function deckFactoryFromObject(constructorObject: {cardType: CardTypes, positionX: number, positionY: number, scale?: number, zIndex?: number, entityId?: string, isBound?: boolean}): DeckEntity {
    const {cardType, isBound, zIndex, scale, entityId, positionY, positionX, } = constructorObject;
    const {baseHeight, baseWidth, suits, cardRange} = cardConfigLookup[cardType];
    return {
        entityId: entityId || uuidv4(),
        entityType: EntityTypes.DECK,
        width: baseWidth,
        height: baseHeight,
        scale: scale || gameConfig.cardScale,
        positionX,
        positionY,
        grabbedBy: null,
        drawIndex: 0,
        zIndex: zIndex || 0,
        isBound: isBound || false,
        cards: suits.reduce<CardRepresentation[]>((cards, suite) => {
            return cards.concat(cardRange.map(face => cardRepFactory(cardType, `${suite} ${face}`)))
        }, [])
    }
}

export function deckFactory(cardType: CardTypes, positionX: number, positionY: number, scale?: number, zIndex?: number, entityId?: string, isBound?: boolean): DeckEntity {
    const {baseHeight, baseWidth, suits, cardRange} = cardConfigLookup[cardType];
    return {
        entityId: entityId || uuidv4(),
        entityType: EntityTypes.DECK,
        width: baseWidth,
        height: baseHeight,
        scale: scale || gameConfig.cardScale,
        positionX,
        positionY,
        grabbedBy: null,
        drawIndex: 0,
        zIndex: zIndex || 0,
        isBound: isBound || false,
        cards: suits.reduce<CardRepresentation[]>((cards, suite) => {
            return cards.concat(cardRange.map(face => cardRepFactory(cardType, `${suite} ${face}`)))
        }, [])
    }
}

export function clientHandFactory(clientId: string): ClientHand {
    return {
        clientId,
        cards: []
    }
}