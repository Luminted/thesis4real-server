import produce from "immer";

import { GameState, CardEntity, DeckEntity } from "../../../../types/dataModelDefinitions";
import { SharedVerb } from "../../../../types/verbTypes";
import { extractClientById, extractEntityByTypeAndId } from "../../../../extractors/gameStateExtractors";
import { gameConfig } from "../../../../config";
import { resetZIndexes } from "../../../../socket-modules/table/utils";

export function handleGrab(state: GameState, verb: SharedVerb) {
    return produce(state, draft => {
        const {positionX, positionY, entityId, entityType, clientId} = verb;
        const {zIndexLimit} = gameConfig;
        const entity = extractEntityByTypeAndId(draft, entityType, entityId);
        if(entity && entity.grabbedBy === null){
            draft.topZIndex++;
            if(draft.topZIndex > zIndexLimit){
                const {cards, decks} = state;
                const absoluteNumberOfEntities = cards.size + decks.size;
                draft.cards = resetZIndexes(cards, absoluteNumberOfEntities, zIndexLimit) as Map<string, CardEntity>;
                draft.decks = resetZIndexes(decks, absoluteNumberOfEntities, zIndexLimit) as Map<string, DeckEntity>;
                draft.topZIndex = absoluteNumberOfEntities - 1;
            }
            extractClientById(draft, verb.clientId).grabbedEntitiy = {
                entityId,
                entityType,
                grabbedAtX: positionX,
                grabbedAtY: positionY
            }
            entity.grabbedBy = clientId;
            entity.zIndex = draft.topZIndex;
        }
    })
}