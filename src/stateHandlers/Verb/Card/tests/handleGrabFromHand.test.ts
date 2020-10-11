import assert from 'assert';
import { CardVerbTypes, IGrabFromHandVerb } from "../../../../types/verb";
import { EntityTypes, GrabbedEntity } from "../../../../types/dataModelDefinitions";
import { createClientHand } from "../../../../factories";
import { extractClientById, extractCardById, extractClientHandById } from '../../../../extractors/gameStateExtractors';
import { CardVerbHandler } from '../CardVerbHandler';
import { Container } from 'typescript-ioc';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';
import { mockClient1 } from '../../../../mocks/clientMocks';
import { handCardMock1 } from '../../../../mocks/entityMocks';

//TODO: test for grabbedAt and grabbedFrom
describe(`handle ${CardVerbTypes.GRAB_FROM_HAND} verb`, function() {
    
    const cardVerbHandler = new CardVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const {clientInfo: {clientId}}  = mockClient1;
    const {entityId} = handCardMock1;
    const verb: IGrabFromHandVerb = {
        clientId,
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
            draft.clients.set(clientId, {...mockClient1});
            draft.hands.set(clientId, createClientHand(clientId));
            draft.hands.get(clientId).cards.push({...handCardMock1});
        })
    })

    it('should set grabbed entity of correct client with the cards data', function(){
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const nextClient = extractClientById(nextGameState, verb.clientId);
        const expectedGrabbedEntity: GrabbedEntity = {
            entityId: verb.entityId,
            entityType: EntityTypes.CARD,
            grabbedAtX: verb.positionX,
            grabbedAtY: verb.positionY
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

    it('should set grabbedBy of grabbed card to client ID', function(){
        const {entityId} = handCardMock1;

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
