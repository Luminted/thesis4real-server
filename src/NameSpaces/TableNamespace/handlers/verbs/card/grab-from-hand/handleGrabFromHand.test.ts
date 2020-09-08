import * as assert from 'assert';
import {spy} from 'sinon';
import { CardVerbTypes, CardVerb } from "../../../../../../types/verbTypes";
import { GrabbedEntity, CardTypes } from "../../../../../../types/dataModelDefinitions";
import { cardFactory, clientHandFactory } from "../../../../../../factories";
import { handleGrabFromHand } from "./handleGrabFromHand";
import { extractClientById, extractCardById, extractClientHandById } from '../../../../../../extractors/gameStateExtractors';
import { cardConfigLookup } from '../../../../../../config';
import * as utils from '../../../../utils';
import { GameStateStore } from '../../../../../../Store/GameStateStore';
import { createClient } from '../../../../../../mocks/client';

describe(`handle ${CardVerbTypes.GRAB_FROM_HAND} verb`, function() {
    let gameStateStore = new GameStateStore();
    let client = createClient('socket-1');
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
        gameStateStore.changeState(draft => handleGrabFromHand(draft, verb));
        const nextClient = extractClientById(gameStateStore.state, verb.clientId);
        const expectedGrabbedEntity: GrabbedEntity = {
            entityId: verb.entityId,
            entityType: verb.entityType,
            grabbedAtX: verb.positionX,
            grabbedAtY: verb.positionY
        }
        assert.deepEqual(nextClient.grabbedEntitiy, expectedGrabbedEntity);
    })

    it('should add grabbed card to cards', function(){
        gameStateStore.changeState(draft => handleGrabFromHand(draft, verb));
        const grabbedCard = extractCardById(gameStateStore.state, verb.entityId);
        assert.notEqual(grabbedCard, undefined);
    });

    it('should put the card at the correct position', function(){
        const {entityScale} = gameStateStore.state;
        const {baseHeight, baseWidth} = cardConfigLookup[cardToGrab.cardType];
        gameStateStore.changeState(draft => handleGrabFromHand(draft, verb));
        const grabbedCard = extractCardById(gameStateStore.state, verb.entityId);
        const expectedPositionX = verb.positionX - Math.round(baseWidth * entityScale / 2);
        const expectedPositionY = verb.positionY - Math.round(baseHeight * entityScale / 2);
        assert.equal(grabbedCard.positionX, expectedPositionX);
        assert.equal(grabbedCard.positionY, expectedPositionY);
    })

    it('should remove card from correct hand', function(){
        gameStateStore.changeState(draft => handleGrabFromHand(draft, verb));
        const nextHand = extractClientHandById(gameStateStore.state, verb.clientId);
        assert.equal(nextHand.cards.find(card => card.entityId !== verb.entityId), undefined);
    })

    it('should set grabbedBy of grabbed card to client ID', function(){
        const {entityId} = cardToGrab;
        gameStateStore.changeState(draft => handleGrabFromHand(draft, verb));
        const grabbedCard = extractCardById(gameStateStore.state, entityId);
        assert.equal(grabbedCard.grabbedBy, client.clientInfo.clientId);
    })

    it('should set z-index of grabbed card to result of calcNextZIndex', function(){
        const calcNextZIndexSpy = spy(utils, 'calcNextZIndex');
        gameStateStore.changeState(draft => handleGrabFromHand(draft, verb));
        const grabbedCard = extractCardById(gameStateStore.state, verb.entityId);
        assert.equal(grabbedCard.zIndex, calcNextZIndexSpy.returnValues[0]);
        calcNextZIndexSpy.restore()
    })

    
})
