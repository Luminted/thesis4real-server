import produce from 'immer';

import { DeckVerb } from '../../../.././types/verbTypes'
import { GameState } from '../../../.././types/dataModelDefinitions';
import { baseCardFactory } from '../../../../factories';
import { extractDeckById } from '../../../../extractors/gameStateExtractors';

export function handleReset(state: GameState, verb: DeckVerb): GameState {
    return produce(state, draft => {
        const {entityId } = verb;
        const cardsOnTable = state.cards.filter(c => c.ownerDeck === entityId);
        const cardsInHand = state.hands.reduce((acc, curr) => acc.concat(curr.cards.filter(card => card.ownerDeck === entityId)), []);
        const resetBaseCards = cardsOnTable.concat(cardsInHand).map(card => baseCardFactory(card.cardType, card.face, card.entityId, card.ownerDeck, card.faceUp));
        draft.cards = state.cards.filter(card => card.ownerDeck !== entityId);
        extractDeckById(draft, entityId).cards.push(...resetBaseCards);
        draft.hands.forEach(hand => {
            hand.cards = hand.cards.filter(card => card.ownerDeck !== entityId);
        })
    })
}