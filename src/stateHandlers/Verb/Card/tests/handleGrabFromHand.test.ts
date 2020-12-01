import assert from 'assert';
import { CardVerbTypes, IGrabFromHandVerb } from "../../../../types/verb";
import { EntityTypes, GrabbedEntity } from "../../../../types/dataModelDefinitions";
import { extractClientById, extractCardById, extractClientHandById } from '../../../../extractors/gameStateExtractors';
import { CardVerbHandler } from '../CardVerbHandler';
import { Container } from 'typescript-ioc';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';
import { mockClient1, mockClient2 } from '../../../../mocks/clientMocks';
import { handCardMock1, handCardMock2 } from '../../../../mocks/entityMocks';
import { TableHandler } from '../../../Table';

describe(`handle ${CardVerbTypes.GRAB_FROM_HAND} verb`, () => {
    
    const cardVerbHandler = new CardVerbHandler();
    const tableHandler = new TableHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const {clientInfo: {clientId: client1Id}}  = mockClient1;
    const {clientInfo: {clientId: client2Id}} = mockClient2;
    const {entityId} = handCardMock1;
    const verb: IGrabFromHandVerb = {
        clientId: client2Id,
        faceUp: false,
        type: CardVerbTypes.GRAB_FROM_HAND,
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

    it('should set grabbed entity of correct client with the cards data', () =>{
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const nextClient = extractClientById(nextGameState, verb.clientId);
        const expectedGrabbedEntity: GrabbedEntity = {
            entityId: verb.entityId,
            entityType: EntityTypes.CARD,
            grabbedAtX: verb.grabbedAtX,
            grabbedAtY: verb.grabbedAtY
        }
        assert.deepEqual(nextClient.grabbedEntity, expectedGrabbedEntity);
    })

    it('should add grabbed card to cards', () =>{
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(nextGameState, verb.entityId);

        assert.notEqual(grabbedCard, undefined);
    });

    it('should put the card at the position according to the verb', () =>{ 
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(nextGameState, verb.entityId);
        const expectedPositionX = verb.positionX;
        const expectedPositionY = verb.positionY;

        assert.equal(grabbedCard.positionX, expectedPositionX);
        assert.equal(grabbedCard.positionY, expectedPositionY);
    })

    it('should remove card from hand it was grabbed from', () =>{
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const nextHand = extractClientHandById(nextGameState, verb.grabbedFrom);

        assert.equal(nextHand.cards.some(card => card.entityId === verb.entityId), false);
    })
    it('should set faceUp of grabbed card according to verb', () => {
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(nextGameState, entityId);

        assert.equal(grabbedCard.faceUp, verb.faceUp);
    })
    it('should update hand ordering accordingly', () => {
        const {entityId} = handCardMock2;
        gameStateStore.changeState(draft => {
            const handDraft = extractClientHandById(draft ,client1Id);
            handDraft.cards.push({...handCardMock2}, {...handCardMock1});
            handDraft.ordering.push(1,2);
        })

        const nextGameState = cardVerbHandler.grabFromHand({...verb, entityId});
        
        const {ordering} = extractClientHandById(nextGameState, client1Id);
        assert.deepEqual(ordering, [0,1]);
    })

    it('should set grabbedBy of grabbed card to client ID', () =>{
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(nextGameState, entityId);

        assert.equal(grabbedCard.grabbedBy, client2Id);
    })

    it('should set z-index of grabbed card to next one in line', () =>{
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(nextGameState, verb.entityId);

        assert.equal(grabbedCard.zIndex, 1);
    })

    
})
