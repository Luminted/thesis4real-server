import { clientFactory, clientHandFactory } from "../../../../factories";
import { GameState } from "../../../../types/dataModelDefinitions";
import { extractEmptySeats } from "../../../../extractors/gameStateExtractors";

//TODO: rework payload
export function handleJoinTable(draft: GameState, clientId: string){
    const nextEmptySeat = extractEmptySeats(draft).pop();
    const newClient = clientFactory(clientId, nextEmptySeat);
    const newHand = clientHandFactory(clientId);
    draft.clients.set(clientId, newClient);
    draft.hands.set(clientId, newHand);
}