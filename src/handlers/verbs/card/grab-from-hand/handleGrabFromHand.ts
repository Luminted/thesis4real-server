import produce from "immer";

import { GameState } from "../../../../types/dataModelDefinitions";
import { CardVerb } from "../../../../types/verbTypes";
import { cardFactory } from "../../../../factories";
import { cardConfigLookup } from "../../../../config/cardTypeConfigs";
import { extractCardFromClientHandById, extractClientHandById, extractClientById } from "../../../../extractors/gameStateExtractors";

export function handleGrabFromHand(state: GameState, verb: CardVerb): GameState{
    return produce(state, draft => {
        const {clientId,entityId, entityType, positionX,positionY} = verb;
        const {cardType, face, faceUp, ownerDeck} = extractCardFromClientHandById(draft, clientId, entityId);
        const {baseWidth, baseHeight} = cardConfigLookup[cardType];
        const {cardScale} = state;
        const positionOffsetX = Math.round(baseWidth * cardScale / 2);
        const positionOffsetY = Math.round(baseHeight * cardScale / 2);
            const grabbedCard = cardFactory(positionX - positionOffsetX, positionY - positionOffsetY, cardType, face, faceUp, entityId, ownerDeck);
            draft.cards.push(grabbedCard);
            extractClientHandById(draft, clientId).cards = extractClientHandById(state, clientId).cards.filter(card => card.entityId !== entityId);
            extractClientById(draft, clientId).grabbedEntitiy = {
                entityId,
                entityType,
                grabbedAtX: positionX,
                grabbedAtY: positionY
            }
    })
}