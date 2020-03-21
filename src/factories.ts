import * as uuidv4 from 'uuid/v4';

import {Client, CardEntity, DeckEntity, EntityTypes} from '../../common/dataModelDefinitions';
import {frenchCardConfig} from './gameConfig';
import { CardVerbTypes } from '../../common/verbTypes';

export function clientFactory(): Client {
    return {
        clientInfo:{
            clientId: uuidv4(),
        },
        grabbedEntitiy: null
    }
}

export function cardFactory(positionX: number, positionY: number, face?: string): CardEntity {
    return {
        face,
        entityId: uuidv4(),
        entityType: EntityTypes.CARD,
        width: frenchCardConfig.baseWidth,
        height: frenchCardConfig.baseHeight,
        scale: frenchCardConfig.scale,
        positionX,
        positionY,
    }
}

export function deckFactory(positionX: number, positionY: number, spawnOffsetX: number, spawnOffsetY: number): DeckEntity {
    const {baseHeight, baseWidth,scale, suits, cardRange} = frenchCardConfig;
    return {
        entityId: uuidv4(),
        entityType: EntityTypes.DECK,
        width: baseWidth,
        height: baseHeight,
        scale: scale,
        positionX,
        positionY,
        cards: suits.map(suite => (cardRange.map(card => cardFactory(positionX + spawnOffsetX, positionY + spawnOffsetY, `${suite} ${card}  `)))).reduce((acc, curr) => acc.concat(curr), [])
    }
}