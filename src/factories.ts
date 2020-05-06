import uuidv4 from 'uuid/v4';
import Hashmap from 'hashmap';

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

export function cardFactory(positionX: number, positionY: number, cardType: CardTypes, face?: string, turnedUp: boolean = true, entityId?: string, ownerDeck: string = null, scale?: number, grabLocked?: boolean): CardEntity {
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
        grabLocked: grabLocked || false,
    }
    return card;
}

export function baseCardFactory(cardType: CardTypes, face: string, entityId?: string, ownerDeck?: string, faceUp?: boolean): CardRepresentation {
    return {
        cardType,
        entityId: entityId || uuidv4(),
        entityType: EntityTypes.CARD,
        face,
        ownerDeck: ownerDeck || null,
        faceUp: faceUp || true
    }
}

export function deckFactory(cardType: CardTypes, positionX: number, positionY: number, scale?: number): DeckEntity {
    const {baseHeight, baseWidth, suits, cardRange} = cardConfigLookup[cardType];
    let a = suits.map(suite => (cardRange.map(card => baseCardFactory(cardType, `${suite} ${card}  `)))).reduce((acc, curr) => acc.concat(curr), [])
    return {
        entityId: uuidv4(),
        entityType: EntityTypes.DECK,
        width: baseWidth,
        height: baseHeight,
        scale: scale || gameConfig.cardScale,
        positionX,
        positionY,
        grabLocked: false,
        drawIndex: 0,
        cards: new Hashmap<string, CardRepresentation>() 
    }
}

export function clientHandFactory(clientId: string): ClientHand {
    return {
        clientId,
        cards: new Hashmap<string, CardRepresentation>
    }
}