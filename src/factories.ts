import * as uuidv4 from 'uuid/v4';

import {Client, CardDataModel, EntityTypes} from './types/dataModelDefinitions';
import {cardConfig} from './gameConfig';

export function clientFactory(): Client {
    return {
        clientInfo:{
            clientId: uuidv4(),
        },
        grabbedEntitiy: null
    }
}

export function cardFactory(positionX: number, positionY: number): CardDataModel {
    return {
        entityId: uuidv4(),
        entityType: EntityTypes.CARD,
        width: cardConfig.baseWidth,
        height: cardConfig.baseHeight,
        scale: cardConfig.scale,
        positionX,
        positionY,
    }
}