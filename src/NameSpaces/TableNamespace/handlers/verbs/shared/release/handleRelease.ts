import { GameState } from "../../../../../../types/dataModelDefinitions"
import { SharedVerb } from "../../../../../../types/verbTypes"
import { extractClientById, extractEntityByTypeAndId } from "../../../../../../extractors/gameStateExtractors"

export function handleRelease(draft: GameState, verb: SharedVerb) {
    const {entityType, entityId} = verb;
    extractClientById(draft, verb.clientId).grabbedEntitiy = null;
    extractEntityByTypeAndId(draft, entityType, entityId).grabbedBy = null;
}