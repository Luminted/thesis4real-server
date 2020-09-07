import { GameState } from "../../../../types/dataModelDefinitions";
import { extractClientById } from "../../../../extractors/gameStateExtractors";

export function handleDisconnect(draft: GameState, clientId: string){
    const client = extractClientById(draft, clientId);
    if(client){
        const {seatedAt} = client.clientInfo;
        draft.clients.delete(clientId);
        draft.hands.delete(clientId);
        draft.emptySeats.push(seatedAt);
    }
}