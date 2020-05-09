import { GameState } from "../../../../types/dataModelDefinitions";
import { CardVerb } from "../../../../types/verbTypes";
import produce from "immer";
import { cardRepFactory} from "../../../../factories";
import { extractCardById, extractClientHandById, extractClientById, extractDeckById } from "../../../../extractors/gameStateExtractors";

export function handlePutInHand(state: GameState, verb: CardVerb): GameState {
    return produce(state, draft => {
        const {clientId, entityId} = verb;
        const {face, cardType, ownerDeck} = extractCardById(state, entityId);
        const deck = extractDeckById(state, ownerDeck);
        if(deck && deck.cards.find(card => card.entityId === entityId)){
            return;
        }
        const baseCard = cardRepFactory(cardType, face, entityId);
        let clientHand =extractClientHandById(draft, clientId)
        clientHand.cards.push(baseCard);
        extractClientById(draft, clientId).grabbedEntitiy = null;
        draft.cards.delete(entityId);
    })
}