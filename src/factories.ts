import uuidv4 from 'uuid/v4';

import {Client, CardEntity, DeckEntity, EntityTypes, CardRepresentation, ClientHand, Directions, CardTypes} from './types/dataModelDefinitions';
import {cardConfigLookup, gameConfig} from './config';

export function clientFactory(socketId: string, seatedAt?: Directions): Client {
    return {
        clientInfo:{
            clientId: socketId,
            seatedAt: seatedAt || null
        },
        grabbedEntitiy: null
    }
}

export function cardFactory(positionX: number, positionY: number, cardType: CardTypes, face?: string, turnedUp: boolean = true, entityId?: string, ownerDeck: string = null, scale?: number, grabbedBy?: string): CardEntity {
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

export function deckFactory(cardType: CardTypes, positionX: number, positionY: number, scale?: number): DeckEntity {
    const {baseHeight, baseWidth, suits, cardRange} = cardConfigLookup[cardType];
    return {
        entityId: uuidv4(),
        entityType: EntityTypes.DECK,
        width: baseWidth,
        height: baseHeight,
        scale: scale || gameConfig.cardScale,
        positionX,
        positionY,
        grabbedBy: null,
        drawIndex: 0,
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