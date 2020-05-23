import {produce} from 'immer';
import { GameState } from '../../../../../../types/dataModelDefinitions';
import { SharedVerb } from '../../../../../../types/verbTypes';
import { extractEntityByTypeAndId } from '../../../../../../extractors/gameStateExtractors';

export function handleMoveTo(state: GameState, verb: SharedVerb) {
    return produce(state, draft => {
        const {positionX, positionY} = verb;
        const entityToMove = extractEntityByTypeAndId(draft, verb.entityType, verb.entityId);
        entityToMove.positionX = positionX;
        entityToMove.positionY = positionY;
    })
}