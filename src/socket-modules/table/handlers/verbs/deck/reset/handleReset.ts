import produce from 'immer';

import { DeckVerb } from '../../../../../../types/verbTypes'
import { GameState } from '../../../../../../types/dataModelDefinitions';
import { cardRepFactory, createCardRepresentationFromCardEntity } from '../../../../../../factories';
import { extractDeckById } from '../../../../../../extractors/gameStateExtractors';

export function handleReset(state: GameState, verb: DeckVerb): GameState {
    return produce(state, draft => {
        const {entityId } = verb;
        const deck = extractDeckById(draft, entityId);
        // TODO: nested interation needs to be optimized
        //removing from table
        deck.drawIndex = 0;
        state.cards.forEach(card => {
            if(card.ownerDeck === entityId){
                draft.cards.delete(card.entityId);
            }
        })

        //removing from hands
        draft.hands.forEach(hand => {
            const {clientId} = hand;
            hand.cards = state.hands.get(clientId).cards.filter(card => card.ownerDeck !== entityId);
            })

        //removing greabbed cards
        draft.clients.forEach(client => {
            const {grabbedEntitiy} = client;
            if(grabbedEntitiy && grabbedEntitiy.entityId === entityId){
                client.grabbedEntitiy = null;
            }
        })
        })

    }