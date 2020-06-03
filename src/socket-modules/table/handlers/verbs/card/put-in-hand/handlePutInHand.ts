import { GameState } from "../../../../../../types/dataModelDefinitions";
import { CardVerb } from "../../../../../../types/verbTypes";
import produce from "immer";
import { createCardRep} from "../../../../../../factories";
import { extractCardById, extractClientHandById, extractClientById, extractDeckById } from "../../../../../../extractors/gameStateExtractors";

export function handlePutInHand(state: GameState, verb: CardVerb): GameState {
    return produce(state, draft => {
        const {clientId, entityId} = verb;
        const {face, cardType, ownerDeck} = extractCardById(state, entityId);
        const deck = extractDeckById(state, ownerDeck);
        console.log(deck && deck.drawIndex === 0);
        if(deck && deck.drawIndex === 0){
            return;
        }
        const cardRepresentation = createCardRep(cardType, face, entityId);
        let clientHand =extractClientHandById(draft, clientId)
        clientHand.cards.push(cardRepresentation);
        extractClientById(draft, clientId).grabbedEntitiy = null;
        draft.cards.delete(entityId);
    })
}