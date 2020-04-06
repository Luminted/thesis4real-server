import * as uuidv4 from 'uuid/v4';

import {Client, DisplayCardEntity, DeckEntity, EntityTypes, BaseCard, ClientHand, Directions, CardTypes} from './types/dataModelDefinitions';
import {cardConfigLookup} from './config';
import { getGameState } from './state';

export function clientFactory(socketId: string, seatedAt?: Directions): Client {
    return {
        socketId,
        clientInfo:{
            clientId: uuidv4(),
            seatedAt
        },
        grabbedEntitiy: null
    }
}

export function cardFactory(positionX: number, positionY: number, cardType: CardTypes, face?: string, turnedUp: boolean = true, entityId?: string, ownerDeck: string = null, scale?: number): DisplayCardEntity {
    let cardConfig = cardConfigLookup[cardType];
    let card: DisplayCardEntity =  {
        face,
        cardType,
        entityId: entityId || uuidv4(),
        entityType: EntityTypes.CARD,
        width: cardConfig.baseWidth,
        height: cardConfig.baseHeight,
        scale: scale || getGameState().cardScale,
        positionX,
        positionY,
        faceUp: turnedUp,
        ownerDeck,
    }
    return card;
}

export function baseCardFactory(cardType: CardTypes, face: string, entityId?: string, ownerDeck?: string, faceUp?: boolean): BaseCard {
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
    return {
        entityId: uuidv4(),
        entityType: EntityTypes.DECK,
        width: baseWidth,
        height: baseHeight,
        scale: scale || getGameState().cardScale,
        positionX,
        positionY,
        drawIndex: 0,
        cards: suits.map(suite => (cardRange.map(card => baseCardFactory(cardType, `${suite} ${card}  `)))).reduce((acc, curr) => acc.concat(curr), [])
    }
}

export function clientHandFactory(clientId: string): ClientHand {
    return {
        clientId,
        cards: []
    }
}