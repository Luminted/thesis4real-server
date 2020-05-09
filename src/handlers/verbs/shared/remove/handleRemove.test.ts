import * as assert from 'assert';
import produce from "immer";

import { SharedVerbTypes, SharedVerb } from '../../../.././types/verbTypes';
import { GameState, EntityTypes, CardTypes } from '../../../.././types/dataModelDefinitions';
import { clientFactory, cardFactory, deckFactory } from '../../../../factories';
import { handleRemove } from './handleRemove';
import {initialGameState} from '../../../../mocks/initialGameState'



describe(`handle ${SharedVerbTypes.REMOVE} verb`, function() {

    let gameState: GameState;
    let client = clientFactory('socket-1');
    const deckToRemove = deckFactory(CardTypes.FRENCH, 10,10);
    const cardToRemove = cardFactory(100,0, CardTypes.FRENCH);
    const verbType = SharedVerbTypes.REMOVE;

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards.set(cardToRemove.entityId, cardToRemove); 
            draft.decks.set(cardToRemove.entityId, deckToRemove);
            draft.clients.set(client.clientInfo.clientId ,client);
        })
    })

    it('should remove correct deck from game state', function() {
        const verb: SharedVerb = {
            type: verbType,
            clientId: client.clientInfo.clientId,
            positionX: 0,
            positionY: 0,
            entityId: deckToRemove.entityId,
            entityType: EntityTypes.DECK
        }

        const nextGameState = handleRemove(gameState, verb);
        assert.equal(nextGameState.decks.has(deckToRemove.entityId), false);
    })

    it('should remove correct card from game state', function() {
        const verb: SharedVerb = {
            type: verbType,
            clientId: client.clientInfo.clientId,
            positionX: 0,
            positionY: 0,
            entityId: cardToRemove.entityId,
            entityType: EntityTypes.CARD
        }

        const nextGameState = handleRemove(gameState, verb);
        assert.equal(nextGameState.cards.has(cardToRemove.entityId), false);
    })

})