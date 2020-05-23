import { GameState } from "../../../../types/dataModelDefinitions";
import produce from "immer";
import { extractClientById } from "../../../../extractors/gameStateExtractors";
import { ClientConnectionStatuses } from "../../../../types/socketTypes";

export function handleRejoinTable(state: GameState, clientId: string){
    return produce(state, draft => {
        extractClientById(draft, clientId).status = ClientConnectionStatuses.CONNECTED;
    })
}