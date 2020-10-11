import assert from 'assert';
import { CardVerbTypes, IPutInHandVerb } from '../../../../types/verb';
import { createClientHand } from '../../../../factories';
import { extractCardById, extractGrabbedEntityOfClientById, extractCardFromClientHandById } from '../../../../extractors/gameStateExtractors';
import { mockClient1 } from '../../../../mocks/clientMocks';
import { Container } from 'typescript-ioc';
import { CardVerbHandler } from '../CardVerbHandler';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';
import { cardEntityMock1 } from '../../../../mocks/entityMocks';

describe(`handle ${CardVerbTypes.PUT_IN_HAND} verb`, function() {
    const cardVerbHandler = new CardVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const client = {...mockClient1};
    const {entityId, entityType} = cardEntityMock1;
    client.grabbedEntitiy = {
        entityId: entityId,
        entityType: entityType,
        grabbedAtX: 15,
        grabbedAtY: 20
    }
    const verb: IPutInHandVerb = {
        type: CardVerbTypes.PUT_IN_HAND,
        clientId: client.clientInfo.clientId,
        entityId: entityId,
    } 

    beforeEach('Setting up test data...', () => {
        const {clientId} = client.clientInfo;
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.cards.set(entityId, {...cardEntityMock1});
            draft.clients.set(clientId, client);
            draft.hands.set(clientId, createClientHand(clientId))
        })
    })

    it('should add the grabbed card to the correct hand', function(){
        const {clientId} = client.clientInfo;
        const nextGameState = cardVerbHandler.putInHand(verb);
        const cardPutInHand = extractCardFromClientHandById(nextGameState, clientId, entityId);
        assert.notEqual(cardPutInHand, undefined);
    })

    it('should set clients grabbed card to null', function() {  
        const nextGameState = cardVerbHandler.putInHand(verb);
        const grabbedEntitiy = extractGrabbedEntityOfClientById(nextGameState, client.clientInfo.clientId);
        assert.equal(grabbedEntitiy, null);
    })
    it('should take out correct card from cards array', function() {
        const nextGameState = cardVerbHandler.putInHand(verb);
        assert.equal(extractCardById(nextGameState ,entityId), undefined);
    })
})