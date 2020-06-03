import { createClient, clientHandFactory } from "../../../../factories";
import { GameState } from "../../../../types/dataModelDefinitions";
import produce from "immer";
import { extractEmptySeats } from "../../../../extractors/gameStateExtractors";

//TODO: rework payload
export function handleJoinTable(state: GameState, clientId: string){
    return produce(state, draft => {
        const nextEmptySeat = extractEmptySeats(draft).pop();
        const newClient = createClient(clientId, nextEmptySeat);
        const newHand = clientHandFactory(clientId);
        draft.clients.set(clientId, newClient);
        draft.hands.set(clientId, newHand);
    })
}