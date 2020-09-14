import * as assert from 'assert';
import { CardVerbTypes, CardVerb } from "../../../../types/verbTypes";
import { GrabbedEntity, CardTypes } from "../../../../types/dataModelDefinitions";
import { cardFactory, clientHandFactory } from "../../../../factories";
import { extractClientById, extractCardById, extractClientHandById } from '../../../../extractors/gameStateExtractors';
import { cardConfigLookup } from '../../../../config';
import { createClient } from '../../../../mocks/client';
import { CardVerbHandler } from '../CardVerbHandler';
import { Container } from 'typescript-ioc';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';

describe(`handle ${CardVerbTypes.GRAB_FROM_HAND} verb`, function() {
    
    const cardVerbHandler = new CardVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const client = createClient('socket-1');
    const cardToGrab = cardFactory(0,0,CardTypes.FRENCH);
    const verb: CardVerb = {
        type: CardVerbTypes.GRAB_FROM_HAND,
        clientId: client.clientInfo.clientId,
        positionX: 0,
        positionY: 0,
        entityId: cardToGrab.entityId,
        entityType: cardToGrab.entityType,
    } 

    beforeEach('Setting up test data...', () => {
        const {clientId} = client.clientInfo;
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.clients.set(clientId, client);
            draft.hands.set(clientId, clientHandFactory(clientId));
            draft.hands.get(clientId).cards.push(cardToGrab);
        })
    })

    it('should set grabbed entity of correct client with the cards data', function(){
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const nextClient = extractClientById(nextGameState, verb.clientId);
        const expectedGrabbedEntity: GrabbedEntity = {
            entityId: verb.entityId,
            entityType: verb.entityType,
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
        const {entityScale} = gameStateStore.state;
        const {baseHeight, baseWidth} = cardConfigLookup[cardToGrab.cardType];
        
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(nextGameState, verb.entityId);
        const expectedPositionX = verb.positionX - Math.round(baseWidth * entityScale / 2);
        const expectedPositionY = verb.positionY - Math.round(baseHeight * entityScale / 2);

        assert.equal(grabbedCard.positionX, expectedPositionX);
        assert.equal(grabbedCard.positionY, expectedPositionY);
    })

    it('should remove card from correct hand', function(){
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const nextHand = extractClientHandById(nextGameState, verb.clientId);

        assert.equal(nextHand.cards.find(card => card.entityId !== verb.entityId), undefined);
    })

    it('should set grabbedBy of grabbed card to client ID', function(){
        const {entityId} = cardToGrab;

        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(nextGameState, entityId);

        assert.equal(grabbedCard.grabbedBy, client.clientInfo.clientId);
    })

    it('should set z-index of grabbed card to next one in line', function(){
        const nextGameState = cardVerbHandler.grabFromHand(verb);
        const grabbedCard = extractCardById(nextGameState, verb.entityId);

        assert.equal(grabbedCard.zIndex, 1);
    })

    
})
