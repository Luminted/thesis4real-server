import { GameState } from "../../../../../../types/dataModelDefinitions";
import { CardVerb } from "../../../../../../types/verbTypes";
import { cardRepFactory} from "../../../../../../factories";
import { extractCardById, extractClientHandById, extractClientById, extractDeckById } from "../../../../../../extractors/gameStateExtractors";

export function handlePutInHand(draft: GameState, verb: CardVerb): GameState {
    const {clientId, entityId} = verb;
    const {face, cardType, ownerDeck} = extractCardById(draft, entityId);
    const deck = extractDeckById(draft, ownerDeck);
    if(deck && deck.cards.find(card => card.entityId === entityId)){
        return;
    }
    const cardRepresentation = cardRepFactory(cardType, face, entityId);
    let clientHand =extractClientHandById(draft, clientId)
    clientHand.cards.push(cardRepresentation);
    extractClientById(draft, clientId).grabbedEntitiy = null;
    draft.cards.delete(entityId);
}