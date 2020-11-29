import assert from 'assert';
import { Container } from 'typescript-ioc';
import { SharedVerbTypes, IRemoveVerb } from '../../../../types/verb';
import { Client, EntityTypes, GrabbedEntity } from '../../../../types/dataModelDefinitions';
import { SharedVerbHandler } from '../SharedVerbHandler';
import { mockClient1, mockClient2 } from '../../../../mocks/clientMocks';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';
import { cardEntityMock1, deckEntityMock1 } from '../../../../mocks/entityMocks';
import { extractClientById } from '../../../../extractors/gameStateExtractors';

describe(`handle ${SharedVerbTypes.REMOVE} verb`, function() {
    const sharedVerbHandler = new SharedVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const {clientInfo: {clientId}} = mockClient1;
    const {entityId: deckEntityId} = deckEntityMock1;
    const {entityId: cardEntityId} = cardEntityMock1;

    beforeEach('Setting up test data...', () => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.cards.set(cardEntityId, {...cardEntityMock1}); 
            draft.decks.set(deckEntityId, {...deckEntityMock1});
            draft.clients.set(clientId , {...mockClient1});
        })
    })

    it('should remove correct deck from game state', function() {
        const verb: IRemoveVerb = {
            type: SharedVerbTypes.REMOVE,
            entityId: deckEntityId,
            entityType: EntityTypes.DECK
        }

        const nextGameState = sharedVerbHandler.remove(verb);

        assert.equal(nextGameState.decks.has(deckEntityId), false);
    })

    it('should remove correct card from game state', function() {
        const verb: IRemoveVerb = {
            type: SharedVerbTypes.REMOVE,
            entityId: cardEntityId,
            entityType: EntityTypes.CARD
        }

        const nextGameState = sharedVerbHandler.remove(verb);

        assert.equal(nextGameState.cards.has(cardEntityId), false);
    })
    it('should set grabbEntity to null if grabbed', () => {
        const verb: IRemoveVerb = {
            type: SharedVerbTypes.REMOVE,
            entityId: cardEntityId,
            entityType: EntityTypes.CARD
        };

        gameStateStore.changeState(draft => {
            const grabbedEntity: GrabbedEntity = {
                entityId: cardEntityId,
                entityType: EntityTypes.CARD,
                grabbedAtX: 0,
                grabbedAtY: 0
            }
            const client2: Client = {...mockClient2, grabbedEntity: grabbedEntity};
            extractClientById(draft, clientId).grabbedEntity = grabbedEntity;
            draft.clients.set(client2.clientInfo.clientId, client2);
        });

        sharedVerbHandler.remove(verb);

        gameStateStore.state.clients.forEach(client => {
            const {grabbedEntity} = client;
            assert.equal(grabbedEntity, null);
        });

    })

})