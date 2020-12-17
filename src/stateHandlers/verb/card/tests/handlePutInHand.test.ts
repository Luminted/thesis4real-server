import assert from 'assert';
import { ECardVerbTypes, IPutInHandVerb } from '../../../../typings';
import { extractCardById, extractGrabbedEntityOfClientById, extractCardFromClientHandById, extractClientHandById } from '../../../../extractors';
import { mockClient1, cardEntityMock1, handCardMock1 } from '../../../../mocks';
import { Container } from 'typescript-ioc';
import { CardVerbHandler } from '../CardVerbHandler';
import { TableHandler } from '../../../table';
import { GameStateStore } from '../../../../stores';

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
        cardVerbHandler.putInHand(verb);
        const cardPutInHand = extractCardFromClientHandById(gameStateStore.state, clientId, entityId);
        assert.notEqual(cardPutInHand, undefined);
    })

    it('should set clients grabbed card to null', () => {  
        cardVerbHandler.putInHand(verb);
        const grabbedEntity = extractGrabbedEntityOfClientById(gameStateStore.state, client.clientInfo.clientId);
        assert.equal(grabbedEntity, null);
    })
    it('should take out correct card from cards array', () => {
        cardVerbHandler.putInHand(verb);
        assert.throws(() => extractCardById(gameStateStore.state ,entityId));
    })
    it('should create hand card with faceUp according to verb', () => {
        const {clientId} = client.clientInfo;
        cardVerbHandler.putInHand(verb);
        const cardPutInHand = extractCardFromClientHandById(gameStateStore.state, clientId, entityId);
        assert.equal(cardPutInHand.faceUp, verb.faceUp);
    })

    it('should update hand ordering', () => {
        const {clientInfo: {clientId}} = client;
        gameStateStore.changeState(draft => {
            const hand = extractClientHandById(draft, clientId)
            hand.cards.push(handCardMock1, handCardMock1);
            hand.ordering = [1, 0];
        })

        cardVerbHandler.putInHand(verb);

        const {ordering} = extractClientHandById(gameStateStore.state, clientId);
        const expectedOrdering = [1, 0, 2];
        assert.deepEqual(ordering, expectedOrdering);
    })
})