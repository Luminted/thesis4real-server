import assert from 'assert';
import { ECardVerbTypes, IGrabFromHandVerb, EEntityTypes, TGrabbedEntity } from "../../../../typings";
import { extractClientById, extractCardById, extractClientHandById } from '../../../../extractors';
import { CardVerbHandler } from '../CardVerbHandler';
import { Container } from 'typescript-ioc';
import { mockClient1, mockClient2, handCardMock1, handCardMock2 } from '../../../../mocks';
import { TableHandler } from '../../../table';
import { GameStateStore } from '../../../../stores';

describe(`Handler for ${ECardVerbTypes.GRAB_FROM_HAND} verb`, () => {
    
    const cardVerbHandler = new CardVerbHandler();
    const tableHandler = new TableHandler();
    const gameStateStore = Container.get(GameStateStore)
    const {clientInfo: {clientId: client1Id}}  = mockClient1;
    const {clientInfo: {clientId: client2Id}} = mockClient2;
    const {entityId} = handCardMock1;
    const verb: IGrabFromHandVerb = {
        clientId: client2Id,
        faceUp: false,
        type: ECardVerbTypes.GRAB_FROM_HAND,
        positionX: 0,
        positionY: 0,
        entityId: entityId,
        grabbedAtX: 14,
        grabbedAtY: 15,
        grabbedFrom: client1Id
    } 

    beforeEach('Setting up test data...', () => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            const hand = tableHandler.createClientHand(client1Id);
            hand.cards.push({...handCardMock1});
            hand.ordering.push(0);
            draft.clients.set(client1Id, {...mockClient1});
            draft.clients.set(client2Id, {...mockClient2});
            draft.hands.set(client1Id, hand);
        })
    })

    it('should set cards as grabbing clients grabbedEntity', () =>{
        cardVerbHandler.grabFromHand(verb);
        const nextClient = extractClientById(gameStateStore.state, verb.clientId);
        const expectedGrabbedEntity: TGrabbedEntity = {
            entityId: verb.entityId,
            entityType: EEntityTypes.CARD,
            grabbedAtX: verb.grabbedAtX,
            grabbedAtY: verb.grabbedAtY
        }
        assert.deepEqual(nextClient.grabbedEntity, expectedGrabbedEntity);
    })

    it('should add grabbed card to cards', () =>{
        cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(gameStateStore.state, verb.entityId);

        assert.notEqual(grabbedCard, undefined);
    });

    it('should put the card at the position described in verb', () =>{ 
        cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(gameStateStore.state, verb.entityId);
        const expectedPositionX = verb.positionX;
        const expectedPositionY = verb.positionY;

        assert.equal(grabbedCard.positionX, expectedPositionX);
        assert.equal(grabbedCard.positionY, expectedPositionY);
    })

    it('should remove card from hand it was grabbed from', () =>{
        cardVerbHandler.grabFromHand(verb);
        const nextHand = extractClientHandById(gameStateStore.state, verb.grabbedFrom);

        assert.equal(nextHand.cards.some(card => card.entityId === verb.entityId), false);
    })
    it('should set faceUp of grabbed card according to verb', () => {
        cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(gameStateStore.state, entityId);

        assert.equal(grabbedCard.faceUp, verb.faceUp);
    })
    it('should update hand ordering accordingly', () => {
        const {entityId} = handCardMock2;
        gameStateStore.changeState(draft => {
            const handDraft = extractClientHandById(draft ,client1Id);
            handDraft.cards.push({...handCardMock2}, {...handCardMock1});
            handDraft.ordering.push(1,2);
        })

        cardVerbHandler.grabFromHand({...verb, entityId});
        
        const {ordering} = extractClientHandById(gameStateStore.state, client1Id);
        assert.deepEqual(ordering, [0,1]);
    })

    it('should set grabbedBy of grabbed card to grabbing clients ID', () =>{
        cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(gameStateStore.state, entityId);

        assert.equal(grabbedCard.grabbedBy, client2Id);
    })

    it('should set z-index of grabbed card to next one in line', () =>{
        cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(gameStateStore.state, verb.entityId);

        assert.equal(grabbedCard.zIndex, 1);
    })

    
})
