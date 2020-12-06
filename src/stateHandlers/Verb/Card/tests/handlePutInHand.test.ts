import assert from 'assert';
import { ECardVerbTypes, IPutInHandVerb } from '../../../../typings';
import { extractCardById, extractGrabbedEntityOfClientById, extractCardFromClientHandById, extractClientHandById } from '../../../../extractors/gameStateExtractors';
import { mockClient1 } from '../../../../mocks/clientMocks';
import { Container } from 'typescript-ioc';
import { CardVerbHandler } from '../CardVerbHandler';
import { cardEntityMock1, handCardMock1 } from '../../../../mocks/entityMocks';
import { TableHandler } from '../../../Table';
import { GameStateStore } from '../../../../stores/GameStateStore';

describe(`handle ${ECardVerbTypes.PUT_IN_HAND} verb`, () => {
    const cardVerbHandler = new CardVerbHandler();
    const tableHandler = new TableHandler();
    const gameStateStore = Container.get(GameStateStore)
    const client = {...mockClient1};
    const {entityId, entityType} = cardEntityMock1;
    client.grabbedEntity = {
        entityId: entityId,
        entityType: entityType,
        grabbedAtX: 15,
        grabbedAtY: 20
    }
    const verb: IPutInHandVerb = {
        type: ECardVerbTypes.PUT_IN_HAND,
        clientId: client.clientInfo.clientId,
        entityId: entityId,
        faceUp: true,
    } 

    beforeEach('Setting up test data...', () => {
        const {clientId} = client.clientInfo;
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.cards.set(entityId, {...cardEntityMock1});
            draft.clients.set(clientId, client);
            draft.hands.set(clientId, tableHandler.createClientHand(clientId))
        })
    })

    it('should add the grabbed card to the correct hand', () =>{
        const {clientId} = client.clientInfo;
        const nextGameState = cardVerbHandler.putInHand(verb);
        const cardPutInHand = extractCardFromClientHandById(nextGameState, clientId, entityId);
        assert.notEqual(cardPutInHand, undefined);
    })

    it('should set clients grabbed card to null', () => {  
        const nextGameState = cardVerbHandler.putInHand(verb);
        const grabbedEntity = extractGrabbedEntityOfClientById(nextGameState, client.clientInfo.clientId);
        assert.equal(grabbedEntity, null);
    })
    it('should take out correct card from cards array', () => {
        const nextGameState = cardVerbHandler.putInHand(verb);
        assert.throws(() => extractCardById(nextGameState ,entityId));
    })
    it('should create hand card with faceUp according to verb', () => {
        const {clientId} = client.clientInfo;
        const nextGameState = cardVerbHandler.putInHand(verb);
        const cardPutInHand = extractCardFromClientHandById(nextGameState, clientId, entityId);
        assert.equal(cardPutInHand.faceUp, verb.faceUp);
    })

    it('should update hand ordering', () => {
        const {clientInfo: {clientId}} = client;
        gameStateStore.changeState(draft => {
            const hand = extractClientHandById(draft, clientId)
            hand.cards.push(handCardMock1, handCardMock1);
            hand.ordering = [1, 0];
        })

        const nextGameState = cardVerbHandler.putInHand(verb);

        const {ordering} = extractClientHandById(nextGameState, clientId);
        const expectedOrdering = [1, 0, 2];
        assert.deepEqual(ordering, expectedOrdering);
    })
})