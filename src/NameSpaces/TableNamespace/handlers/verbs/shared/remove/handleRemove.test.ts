import * as assert from 'assert';
import { SharedVerbTypes, SharedVerb } from '../../../../../../types/verbTypes';
import { EntityTypes, CardTypes } from '../../../../../../types/dataModelDefinitions';
import { cardFactory, deckFactory } from '../../../../../../factories';
import { handleRemove } from './handleRemove';
import { GameStateStore } from '../../../../../../Store/GameStateStore';
import { client1 } from '../../../../../../mocks/client';



describe(`handle ${SharedVerbTypes.REMOVE} verb`, function() {

    let gameStateStore = new GameStateStore();
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

        gameStateStore.changeState(draft => handleRemove(draft, verb));
        assert.equal(gameStateStore.state.decks.has(deckToRemove.entityId), false);
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

        gameStateStore.changeState(draft => handleRemove(draft, verb));
        assert.equal(gameStateStore.state.cards.has(cardToRemove.entityId), false);
    })

})