import { GameState } from "../../../../types/dataModelDefinitions";
import produce from "immer";
import { extractClientById } from "../../../../extractors/gameStateExtractors";

export function handleDisconnect(state: GameState, clientId: string){
    return produce(state, draft => {
        console.log()
        const client = extractClientById(state, clientId);
        if(client){
            const {seatedAt} = client.clientInfo;
            draft.clients.delete(clientId);
            draft.hands.delete(clientId);
            draft.emptySeats.push(seatedAt);
        }
    })
}