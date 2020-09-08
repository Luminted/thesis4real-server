import { GameState, CardEntity } from "../../../../../../types/dataModelDefinitions";
import { CardVerb } from "../../../../../../types/verbTypes";
import { cardFactory } from "../../../../../../factories";
import { extractCardFromClientHandById, extractClientHandById, extractClientById } from "../../../../../../extractors/gameStateExtractors";

export function handlePutOnTable(draft: GameState, verb: CardVerb): GameState{
    const {clientId, entityId, positionX, positionY} = verb;
    const cardPutOnTable = extractCardFromClientHandById(draft, clientId, entityId);
    if(cardPutOnTable){
        const {face, faceUp, ownerDeck, cardType} = cardPutOnTable;
        const owner = draft.decks.get(ownerDeck);
        //abort if card is still in owner deck
        if(owner && owner.cards.find(card => card.entityId === entityId)){
            return;
        }

        //creating entity
        let cardEntity: CardEntity = cardFactory(positionX, positionY, cardType, face, faceUp, entityId, ownerDeck);
        draft.cards.set(cardEntity.entityId, cardEntity);
        
        //removing from hand
        let subjectClientHand = extractClientHandById(draft, clientId);
        if(subjectClientHand){
            subjectClientHand.cards.filter(card => card.entityId !== entityId);
        }

        // removing grabbedEntity
        extractClientById(draft, clientId).grabbedEntitiy = null;
    }
}