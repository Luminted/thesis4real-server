import * as assert from 'assert';
import produce from "immer";

import { SharedVerbTypes, SharedVerb } from '../../../.././types/verbTypes';
import { GameState, EntityTypes, CardTypes } from '../../../.././types/dataModelDefinitions';
import { clientFactory, cardFactory, deckFactory } from '../../../../factories';
import { handleRemove } from './handleRemove';
import {initialGameState} from '../../../../__mocks__/initialGameState'



describe(`handle ${SharedVerbTypes.REMOVE} verb`, function() {

    let gameState: GameState;
    let client = clientFactory('socket-1');
    const verbType = SharedVerbTypes.REMOVE;

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards = [cardFactory(100,0, CardTypes.FRENCH), cardFactory(100,0, CardTypes.FRENCH)]
            draft.decks = [deckFactory(CardTypes.FRENCH, 10,10), deckFactory(CardTypes.FRENCH, 10,10)]
            draft.clients.push(client);
        })
    })

    it('should remove correct deck from game state', function() {
        const deckToRemove = gameState.decks[0];
        const verb: SharedVerb = {
            type: verbType,
            clientId: client.clientInfo.clientId,
            positionX: 0,
            positionY: 0,
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
            positionX: 0,
            positionY: 0,
            entityId: cardToRemove.entityId,
            entityType: EntityTypes.CARD
        }

        const nextGameState = handleRemove(gameState, verb);
        assert.equal(nextGameState.cards.some(d => d.entityId === cardToRemove.entityId), false);
    })

})