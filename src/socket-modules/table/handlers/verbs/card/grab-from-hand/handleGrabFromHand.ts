import produce from "immer";

import { GameState, CardEntity, Entity, DeckEntity } from "../../../../../../types/dataModelDefinitions";
import { CardVerb, DeckVerbTypes } from "../../../../../../types/verbTypes";
import { cardFactory } from "../../../../../../factories";
import { cardConfigLookup } from "../../../../../../config/cardTypeConfigs";
import { extractCardFromClientHandById, extractClientHandById, extractClientById } from "../../../../../../extractors/gameStateExtractors";
import { gameConfig } from "../../../../../../config";
import { calcNextZIndex } from "../../../../utils";

export function handleGrabFromHand(state: GameState, verb: CardVerb): GameState{
    return produce(state, draft => {
        const {clientId,entityId, entityType, positionX,positionY} = verb;
        const cardRep = extractCardFromClientHandById(state, clientId, entityId); 
        const {cardType, face, faceUp, ownerDeck} = cardRep
        const {baseWidth, baseHeight} = cardConfigLookup[cardType];
        const {entityScale} = state;
        const {zIndexLimit} = gameConfig;
        const positionOffsetX = Math.round(baseWidth * entityScale / 2);
        const positionOffsetY = Math.round(baseHeight * entityScale / 2);
        // TODO: card from cardRep function
        const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);
        const grabbedCard = cardFactory(positionX - positionOffsetX, positionY - positionOffsetY, cardType, face, faceUp, entityId, ownerDeck, undefined, clientId, nextTopZIndex);
        draft.cards.set(grabbedCard.entityId, grabbedCard);
        extractClientById(draft, clientId).grabbedEntitiy = {
            entityId,
            entityType,
            grabbedAtX: positionX,
            grabbedAtY: positionY
        }
    })
}