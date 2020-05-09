import { clientFactory, clientHandFactory } from "../../../../factories";
import { GameState } from "../../../../types/dataModelDefinitions";
import produce from "immer";
import { extractEmptySeats } from "../../../../extractors/gameStateExtractors";
import { JoinTablePayload } from "../../../../types/sockeTypes";

export function handleJoinTable(state: GameState, payload: JoinTablePayload){
    return produce(state, draft => {
        const nextEmptySeat = extractEmptySeats(draft).pop();
        const newClient = clientFactory(payload.socketId, nextEmptySeat);
        const newHand = clientHandFactory(newClient.clientInfo.clientId);
        draft.clients.set(newClient.clientInfo.clientId, newClient);
        draft.hands.set(newHand.clientId, newHand);
    })
} 