import { GameState } from "../../../../types/dataModelDefinitions"
import { extractClientHandCardsById, extractClientsSeatById } from "../../../../extractors/gameStateExtractors";
import { cardFactory } from "../../../../factories";
import { calcNextZIndex } from "../../utils";
import { gameConfig } from "../../../../config";

export function handleLeaveTable(draft: GameState, clientId: string, defaultPosition: [number, number]){
    const [positionX, positionY] = defaultPosition;
    const {zIndexLimit} = gameConfig;
    extractClientHandCardsById(draft, clientId).forEach(cardRep => {
        const {cardType, entityId, face, ownerDeck} = cardRep;
        const nextTopZIndex = calcNextZIndex(draft, zIndexLimit);
        const cardEntity = cardFactory(positionX, positionY, cardType, face, true, entityId, ownerDeck, 1, undefined, nextTopZIndex);
        draft.cards.set(cardEntity.entityId, cardEntity);
    });

    draft.emptySeats.push(extractClientsSeatById(draft, clientId));
    draft.hands.delete(clientId);
    draft.clients.delete(clientId);
}