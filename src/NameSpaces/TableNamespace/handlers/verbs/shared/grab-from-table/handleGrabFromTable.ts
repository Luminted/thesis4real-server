import produce from "immer";

import { GameState, CardEntity, DeckEntity } from "../../../../../../types/dataModelDefinitions";
import { SharedVerb } from "../../../../../../types/verbTypes";
import { extractClientById, extractEntityByTypeAndId } from "../../../../../../extractors/gameStateExtractors";
import { gameConfig } from "../../../../../../config";
import { calcNextZIndex } from "../../../../utils";

export function handleGrab(draft: GameState, verb: SharedVerb) {
    const {positionX, positionY, entityId, entityType, clientId} = verb;
    const {zIndexLimit} = gameConfig;
    const entity = extractEntityByTypeAndId(draft, entityType, entityId);
    if(entity && entity.grabbedBy === null){
        const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);
        extractClientById(draft, verb.clientId).grabbedEntitiy = {
            entityId,
            entityType,
            grabbedAtX: positionX,
            grabbedAtY: positionY
        }
        entity.grabbedBy = clientId;
        entity.zIndex = nextTopZIndex;
    }
}