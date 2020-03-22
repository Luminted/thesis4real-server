import * as assert from 'assert';
import {produce} from 'immer';

import { DeckVerbTypes, DeckVerb } from '../../../.././types/verbTypes';
import { GameState, EntityTypes } from '../../../.././types/dataModelDefinitions';
import { clientFactory, cardFactory, deckFactory } from '../../../../factories';
import {handleReset} from './handleReset'

describe(`handle ${DeckVerbTypes.RESET} verb`, function() {
    let initialGameState: GameState = {
        cards: [],
        decks: [],
        clients: []
    };
    let gameState: GameState;
    const client = clientFactory();
    const deck = deckFactory(100,100);
    const verbType = DeckVerbTypes.RESET;

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards = [cardFactory(0,0,undefined, undefined, undefined, deck.entityId), cardFactory(0,100, undefined, undefined, undefined, deck.entityId), cardFactory(100,0)]
            draft.decks = [deck]
            draft.clients.push(client);
        })
    })

    it('should remove all cards belonging to the correct deck', function() {
        const verb: DeckVerb = {
            type: verbType,
            clientId: client.clientInfo.clientId,
            cursorX: 0,
            cursorY: 0,
            entityId: deck.entityId,
            entityType: EntityTypes.DECK
        }

        const nextState = handleReset(gameState, verb);
        assert.equal(nextState.cards.some(card => card.ownerDeck === deck.entityId), false);
    })

})