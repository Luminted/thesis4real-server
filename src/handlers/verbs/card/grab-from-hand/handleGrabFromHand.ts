import produce from "immer";

import { GameState, CardEntity, Entity, DeckEntity } from "../../../../types/dataModelDefinitions";
import { CardVerb, DeckVerbTypes } from "../../../../types/verbTypes";
import { cardFactory } from "../../../../factories";
import { cardConfigLookup } from "../../../../config/cardTypeConfigs";
import { extractCardFromClientHandById, extractClientHandById, extractClientById } from "../../../../extractors/gameStateExtractors";
import { gameConfig } from "../../../../config";
import { resetZIndexes } from "../../../../socket-modules/table/utils";

export function handleGrabFromHand(state: GameState, verb: CardVerb): GameState{
    return produce(state, draft => {
        const {clientId,entityId, entityType, positionX,positionY} = verb;
        const cardRep = extractCardFromClientHandById(state, clientId, entityId); 
        const {cardType, face, faceUp, ownerDeck} = cardRep
        const {baseWidth, baseHeight} = cardConfigLookup[cardType];
        const {cardScale} = state;
        const {zIndexLimit} = gameConfig;
        const positionOffsetX = Math.round(baseWidth * cardScale / 2);
        const positionOffsetY = Math.round(baseHeight * cardScale / 2);
        // TODO: card from cardRep function
        draft.topZIndex++;
        if(draft.topZIndex > zIndexLimit){
            const {cards, decks} = state;
            const absoluteNumberOfEntities = cards.size + decks.size;
            draft.cards = resetZIndexes(cards, absoluteNumberOfEntities, zIndexLimit) as Map<string, CardEntity>;
            draft.decks = resetZIndexes(decks, absoluteNumberOfEntities, zIndexLimit) as Map<string, DeckEntity>;
            draft.topZIndex = absoluteNumberOfEntities - 1;
        }
        const grabbedCard = cardFactory(positionX - positionOffsetX, positionY - positionOffsetY, cardType, face, faceUp, entityId, ownerDeck, undefined, clientId);
        draft.cards.set(grabbedCard.entityId, grabbedCard);
        extractClientById(draft, clientId).grabbedEntitiy = {
            entityId,
            entityType,
            grabbedAtX: positionX,
            grabbedAtY: positionY
        }
    })
}