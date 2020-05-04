import { GameState } from "../../../../types/dataModelDefinitions";
import { CardVerb } from "../../../../types/verbTypes";
import produce from "immer";
import { baseCardFactory} from "../../../../factories";
import { extractCardById, extractClientHandById, extractClientById } from "../../../../extractors/gameStateExtractors";

export function handlePutInHand(state: GameState, verb: CardVerb): GameState {
    return produce(state, draft => {
        const {clientId, entityId} = verb;
        const {face, cardType} = extractCardById(state, entityId);
        const baseCard = baseCardFactory(cardType, face, entityId);
        let clientHand =extractClientHandById(draft, clientId)
        clientHand.cards.push(baseCard);
        extractClientById(draft, clientId).grabbedEntitiy = null;
        draft.cards = state.cards.filter(card => card.entityId !== entityId);
    })
}