import * as assert from 'assert';
import produce from "immer";

import { SharedVerbTypes, SharedVerb } from '../../../../../../common/verbTypes';
import { GameState, EntityTypes } from '../../../../../../common/dataModelDefinitions';
import { clientFactory, cardFactory, deckFactory } from '../../../../factories';
import { handleRemove } from './handleRemove';


describe(`handle ${SharedVerbTypes.REMOVE} verb`, function() {
    let initialGameState: GameState = {
        cards: [],
        decks: [],
        clients: []
    };
    let gameState: GameState;
    let client = clientFactory();
    const verbType = SharedVerbTypes.REMOVE;

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards = [cardFactory(100,0), cardFactory(100,0)]
            draft.decks = [deckFactory(10,10), deckFactory(10,10)]
            draft.clients.push(client);
        })
    })

    it('should remove correct deck from game state', function() {
        const deckToRemove = gameState.decks[0];
        const verb: SharedVerb = {
            type: verbType,
            clientId: client.clientInfo.clientId,
            cursorX: 0,
            cursorY: 0,
            entityId: deckToRemove.entityId,
            entityType: EntityTypes.DECK
        }

        const nextGameState = handleRemove(gameState, verb);
        assert.equal(nextGameState.decks.some(d => d.entityId === deckToRemove.entityId), false);
    })

    it('should remove correct card from game state', function() {
        const cardToRemove = gameState.cards[0];
        const verb: SharedVerb = {
            type: verbType,
            clientId: client.clientInfo.clientId,
            cursorX: 0,
            cursorY: 0,
            entityId: cardToRemove.entityId,
            entityType: EntityTypes.CARD
        }

        const nextGameState = handleRemove(gameState, verb);
        assert.equal(nextGameState.cards.some(d => d.entityId === cardToRemove.entityId), false);
    })

})