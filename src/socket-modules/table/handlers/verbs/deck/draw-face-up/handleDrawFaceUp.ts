import { GameState } from "../../../../../../types/dataModelDefinitions";
import { DeckVerb } from "../../../../../../types/verbTypes";
import produce from "immer";
import { extractDeckById } from "../../../../../../extractors/gameStateExtractors";
import { cardFactory } from "../../../../../../factories";

export function handleDrawFaceUp(state: GameState, verb: DeckVerb): GameState {
    return produce(state, draft => {
        const {entityId} = verb;
        const deck = extractDeckById(draft, entityId);
        const drawnCard = deck.cards[deck.drawIndex];
        const spawnedCard = cardFactory(deck.positionX, deck.positionY, drawnCard.cardType, drawnCard.face, true, drawnCard.entityId, deck.entityId);
        deck.drawIndex++;
        draft.cards.set(spawnedCard.entityId, spawnedCard);
    })
}