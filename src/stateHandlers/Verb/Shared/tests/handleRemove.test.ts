import assert from 'assert';
import { Container } from '../../../../socket/node_modules/typescript-ioc';
import { ESharedVerbTypes, IRemoveVerb, TClient, EEntityTypes, TGrabbedEntity } from '../../../../typings';
import { SharedVerbHandler } from '../SharedVerbHandler';
import { mockClient1, mockClient2 } from '../../../../mocks/clientMocks';
import { cardEntityMock1, deckEntityMock1 } from '../../../../mocks/entityMocks';
import { extractClientById } from '../../../../extractors/gameStateExtractors';
import { GameStateStore } from '../../../../stores/gameStateStore';

describe(`handle ${ESharedVerbTypes.REMOVE} verb`, () => {
    const sharedVerbHandler = new SharedVerbHandler();
    const gameStateStore = Container.get(GameStateStore)
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

    it('should remove correct deck from game state', () => {
        const verb: IRemoveVerb = {
            type: ESharedVerbTypes.REMOVE,
            entityId: deckEntityId,
            entityType: EEntityTypes.DECK
        }

        const nextGameState = sharedVerbHandler.remove(verb);

        assert.equal(nextGameState.decks.has(deckEntityId), false);
    })

    it('should remove correct card from game state', () => {
        const verb: IRemoveVerb = {
            type: ESharedVerbTypes.REMOVE,
            entityId: cardEntityId,
            entityType: EEntityTypes.CARD
        }

        const nextGameState = sharedVerbHandler.remove(verb);

        assert.equal(nextGameState.cards.has(cardEntityId), false);
    })
    it('should set grabbEntity to null if grabbed', () => {
        const verb: IRemoveVerb = {
            type: ESharedVerbTypes.REMOVE,
            entityId: cardEntityId,
            entityType: EEntityTypes.CARD
        };

        gameStateStore.changeState(draft => {
            const grabbedEntity: TGrabbedEntity = {
                entityId: cardEntityId,
                entityType: EEntityTypes.CARD,
                grabbedAtX: 0,
                grabbedAtY: 0
            }
            const client2: TClient = {...mockClient2, grabbedEntity: grabbedEntity};
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