import { GameState } from "../../../../types/dataModelDefinitions";
import { extractClientById } from "../../../../extractors/gameStateExtractors";
import { ClientConnectionStatuses } from "../../../../types/socketTypes";

export function handleRejoinTable(draft: GameState, clientId: string){
    extractClientById(draft, clientId).status = ClientConnectionStatuses.CONNECTED;
}