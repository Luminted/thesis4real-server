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
            let displayCard: CardEntity = cardFactory(positionX, positionY, cardType, face, faceUp, entityId, ownerDeck);
            draft.cards.push(displayCard);
            let subjectClientHand = extractClientHandById(draft, clientId);
            if(subjectClientHand){
                subjectClientHand.cards = subjectClientHand.cards.filter(card => card.entityId !== entityId);
            }
        }
    })
}