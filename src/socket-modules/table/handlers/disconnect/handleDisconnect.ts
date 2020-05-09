import { GameState } from "../../../../types/dataModelDefinitions";
import produce from "immer";
import { extractClientById } from "../../../../extractors/gameStateExtractors";

export function handleDisconnect(state: GameState, socketId: string){
    return produce(state, draft => {
        console.log()
        const client = extractClientById(state, socketId);
        if(client){
            const {seatedAt} = client.clientInfo;
            draft.clients.delete(socketId);
            draft.hands.delete(socketId);
            draft.emptySeats.push(seatedAt);
        }
    })
}