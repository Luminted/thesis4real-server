import * as assert from 'assert';
import { Container } from 'typescript-ioc';
import { SharedVerbTypes, SharedVerb } from '../../../../types/verbTypes';
import { EntityTypes, CardTypes } from '../../../../types/dataModelDefinitions';
import { SharedVerbHandler } from '../SharedVerbHandler';
import { cardFactory, deckFactory } from '../../../../factories';
import { client1 } from '../../../../mocks/client';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';

describe(`handle ${SharedVerbTypes.REMOVE} verb`, function() {
    const sharedVerbHandler = new SharedVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    let client = client1;
    const deckToRemove = deckFactory(CardTypes.FRENCH, 10,10);
    const cardToRemove = cardFactory(100,0, CardTypes.FRENCH);
    const verbType = SharedVerbTypes.REMOVE;

    beforeEach('Setting up test data...', () => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
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

        const nextGameState = sharedVerbHandler.remove(verb);

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

        const nextGameState = sharedVerbHandler.remove(verb);

        assert.equal(nextGameState.cards.has(cardToRemove.entityId), false);
    })

})