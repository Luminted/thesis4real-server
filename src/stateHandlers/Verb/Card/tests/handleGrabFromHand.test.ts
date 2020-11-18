import assert from 'assert';
import { CardVerbTypes, IGrabFromHandVerb } from "../../../../types/verb";
import { EntityTypes, GrabbedEntity } from "../../../../types/dataModelDefinitions";
import { createClientHand } from "../../../../factories";
import { extractClientById, extractCardById, extractClientHandById } from '../../../../extractors/gameStateExtractors';
import { CardVerbHandler } from '../CardVerbHandler';
import { Container } from 'typescript-ioc';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';
import { mockClient1 } from '../../../../mocks/clientMocks';
import { handCardMock1, handCardMock2 } from '../../../../mocks/entityMocks';

//TODO: test for grabbedAt and grabbedFrom
describe(`handle ${CardVerbTypes.GRAB_FROM_HAND} verb`, function() {
    
    const cardVerbHandler = new CardVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const {clientInfo: {clientId}}  = mockClient1;
    const {entityId} = handCardMock1;
    const verb: IGrabFromHandVerb = {
        clientId,
        faceUp: false,
        type: CardVerbTypes.GRAB_FROM_HAND,
        positionX: 0,
        positionY: 0,
        entityId: entityId,
        grabbedAtX: 14,
        grabbedAtY: 15,
        grabbedFrom: clientId
    } 

    beforeEach('Setting up test data...', () => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            const hand = createClientHand(clientId);
            hand.cards.push({...handCardMock1});
            hand.ordering.push(0);
            draft.clients.set(clientId, {...mockClient1});
            draft.hands.set(clientId, hand);
        })
    })

    it('should set grabbed entity of correct client with the cards data', function(){
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const nextClient = extractClientById(nextGameState, verb.clientId);
        const expectedGrabbedEntity: GrabbedEntity = {
            entityId: verb.entityId,
            entityType: EntityTypes.CARD,
            grabbedAtX: verb.grabbedAtX,
            grabbedAtY: verb.grabbedAtY
        }
        assert.deepEqual(nextClient.grabbedEntitiy, expectedGrabbedEntity);
    })

    it('should add grabbed card to cards', function(){
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(nextGameState, verb.entityId);

        assert.notEqual(grabbedCard, undefined);
    });

    it('should put the card at the correct position', function(){ 
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(nextGameState, verb.entityId);
        const expectedPositionX = verb.positionX;
        const expectedPositionY = verb.positionY;

        assert.equal(grabbedCard.positionX, expectedPositionX);
        assert.equal(grabbedCard.positionY, expectedPositionY);
    })

    it('should remove card from correct hand', function(){
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const nextHand = extractClientHandById(nextGameState, verb.clientId);

        assert.equal(nextHand.cards.some(card => card.entityId === verb.entityId), false);
    })
    it('should set faceUp of grabbed card according to verb', () => {
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(nextGameState, entityId);

        assert.equal(grabbedCard.faceUp, verb.faceUp);
    })
    it('should update hand ordering accordingly', () => {
        gameStateStore.changeState(draft => {
            const handDraft = extractClientHandById(draft ,clientId);
            handDraft.cards.push({...handCardMock2}, {...handCardMock1});
            handDraft.ordering.push(1,2);
        })
        const {entityId} = handCardMock2;
        const nextGameState = cardVerbHandler.grabFromHand({...verb, entityId:entityId});

        const {ordering} = extractClientHandById(nextGameState, clientId);
        assert.deepEqual(ordering, [0,1]);
    })

    it('should set grabbedBy of grabbed card to client ID', function(){
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(nextGameState, entityId);

        assert.equal(grabbedCard.grabbedBy, clientId);
    })

    it('should set z-index of grabbed card to next one in line', function(){
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(nextGameState, verb.entityId);

        assert.equal(grabbedCard.zIndex, 1);
    })

    
})
