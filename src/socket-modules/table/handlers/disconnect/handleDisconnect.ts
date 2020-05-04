import { GameState } from "../../../../types/dataModelDefinitions";
import produce from "immer";
import { extractClientById } from "../../../../extractors/gameStateExtractors";

export function handleDisconnect(state: GameState, socketId: string){
    return produce(state, draft => {
        console.log()
        const client = extractClientById(state, socketId);
        if(client){
            const {seatedAt} = client.clientInfo;
            draft.clients = state.clients.filter(client => client.clientInfo.clientId !== socketId);
            draft.hands = state.hands.filter(hand => hand.clientId !== socketId);
            draft.emptySeats.push(seatedAt);
        }
    })
}