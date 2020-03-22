import * as uuidv4 from 'uuid/v4';

import {Client, CardEntity, DeckEntity, EntityTypes, BaseCard} from './types/dataModelDefinitions';
import {frenchCardConfig} from './gameConfig';

export function clientFactory(): Client {
    return {
        clientInfo:{
            clientId: uuidv4(),
        },
        grabbedEntitiy: null
    }
}

export function cardFactory(positionX: number, positionY: number, face?: string, turnedUp: boolean = true, entityId?: string, ownerDeck: string = null): CardEntity {
    let card: CardEntity =  {
        face,
        entityId: entityId || uuidv4(),
        entityType: EntityTypes.CARD,
        width: frenchCardConfig.baseWidth,
        height: frenchCardConfig.baseHeight,
        scale: frenchCardConfig.scale,
        positionX,
        positionY,
        turnedUp,
        ownerDeck
    }
    return card;
}

export function baseCardFactory(face: string): BaseCard {
    return {
        entityId: uuidv4(),
        entityType: EntityTypes.CARD,
        face
    }
}

export function deckFactory(positionX: number, positionY: number): DeckEntity {
    const {baseHeight, baseWidth,scale, suits, cardRange} = frenchCardConfig;
    return {
        entityId: uuidv4(),
        entityType: EntityTypes.DECK,
        width: baseWidth,
        height: baseHeight,
        scale: scale,
        positionX,
        positionY,
        drawIndex: 0,
        cards: suits.map(suite => (cardRange.map(card => baseCardFactory(`${suite} ${card}  `)))).reduce((acc, curr) => acc.concat(curr), [])
    }
}