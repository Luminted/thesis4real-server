import { GameState, CardEntity } from "../../../../types/dataModelDefinitions";
import { CardVerb } from "../../../../types/verbTypes";
import produce from "immer";
import { cardFactory } from "../../../../factories";
import { extractCardFromClientHandById, extractClientHandById } from "../../../../extractors/gameStateExtractors";

export function handlePutOnTable(state: GameState, verb: CardVerb): GameState{
    return produce(state, draft => {
        const {clientId, entityId, positionX, positionY} = verb;
        const cardPutOnTable = extractCardFromClientHandById(state, clientId, entityId);
        if(cardPutOnTable){
            const {face, faceUp, ownerDeck, cardType} = cardPutOnTable;
            const owner = state.decks.get(ownerDeck);
            if(owner && owner.cards.find(card => card.entityId === entityId)){
                return;
            }
            let displayCard: CardEntity = cardFactory(positionX, positionY, cardType, face, faceUp, entityId, ownerDeck);
            draft.cards.set(displayCard.entityId, displayCard);
            let subjectClientHand = extractClientHandById(draft, clientId);
            if(subjectClientHand){
                subjectClientHand.cards.filter(card => card.entityId !== entityId);
            }
        }
    })
}