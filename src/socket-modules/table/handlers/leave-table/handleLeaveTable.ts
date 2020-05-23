import produce from "immer"
import { GameState } from "../../../../types/dataModelDefinitions"
import { extractClientHandCardsById, extractClientsSeatById } from "../../../../extractors/gameStateExtractors";
import { cardFactory } from "../../../../factories";
import { calcNextZIndex } from "../../utils";
import { gameConfig } from "../../../../config";

export function handleLeaveTable(state: GameState, clientId: string, defaultPosition: [number, number]){
    debugger
    return produce(state, draft => {
        const [positionX, positionY] = defaultPosition;
        const {zIndexLimit} = gameConfig;
        extractClientHandCardsById(state, clientId).forEach(cardRep => {
            const {cardType, entityId, entityType, face, faceUp, ownerDeck} = cardRep;
            const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);
            const cardEntity = cardFactory(positionX, positionY, cardType, face, true, entityId, ownerDeck, 1, undefined, nextTopZIndex);
            draft.cards.set(cardEntity.entityId, cardEntity);
        });

        draft.emptySeats.push(extractClientsSeatById(state, clientId));
        draft.hands.delete(clientId);
        draft.clients.delete(clientId);
    })
}