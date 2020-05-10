import * as assert from 'assert';

import { CardVerbTypes, CardVerb } from "../../../../types/verbTypes";
import { GameState, GrabbedEntity, EntityTypes, CardTypes } from "../../../../types/dataModelDefinitions";
import { clientFactory, cardFactory, deckFactory, clientHandFactory } from "../../../../factories";
import produce from "immer";
import { initialGameState } from "../../../../mocks/initialGameState";
import { handleGrabFromHand } from "./handleGrabFromHand";
import { extractClientById, extractCardById, extractGrabbedEntityOfClientById, extractClientHandById } from '../../../../extractors/gameStateExtractors';
import { cardConfigLookup } from '../../../../config';

describe(`handle ${CardVerbTypes.GRAB_FROM_HAND} verb`, function() {
    let gameState: GameState;
    let client = clientFactory('socket-1');
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
        gameState = produce(initialGameState, draft => {
            draft.clients.set(clientId, client);
            draft.hands.set(clientId, clientHandFactory(clientId));
            draft.hands.get(clientId).cards.push(cardToGrab);
        })
    })

    it('should set grabbed entity of correct client with the cards data', function(){
        const nextState = handleGrabFromHand(gameState, verb);
        const nextClient = extractClientById(nextState,verb.clientId);
        const expectedGrabbedEntity: GrabbedEntity = {
            entityId: verb.entityId,
            entityType: verb.entityType,
            grabbedAtX: verb.positionX,
            grabbedAtY: verb.positionY
        }
        assert.deepEqual(nextClient.grabbedEntitiy, expectedGrabbedEntity);
    })

    it('should add grabbed card to cards', function(){
        const nextState = handleGrabFromHand(gameState, verb);
        const grabbedCard = extractCardById(nextState, verb.entityId);
        assert.notEqual(grabbedCard, undefined);
    });

    it('should put the card at the correct position', function(){
        const {cardScale} = gameState;
        const {baseHeight, baseWidth} = cardConfigLookup[cardToGrab.cardType];
        const nextState = handleGrabFromHand(gameState, verb);
        const grabbedCard = extractCardById(nextState, verb.entityId);
        const expectedPositionX = verb.positionX - Math.round(baseWidth * cardScale / 2);
        const expectedPositionY = verb.positionY - Math.round(baseHeight * cardScale / 2);
        assert.equal(grabbedCard.positionX, expectedPositionX);
        assert.equal(grabbedCard.positionY, expectedPositionY);
    })
    it('should remove card from correct hand', function(){
        const nextState = handleGrabFromHand(gameState, verb);
        const nextHand = extractClientHandById(nextState, verb.clientId);
        assert.equal(nextHand.cards.find(card => card.entityId !== verb.entityId), undefined);
    })
    it('should set grabbedBy to client ID', function(){
        const {entityId} = cardToGrab;
        const nextState = handleGrabFromHand(gameState, verb);
        const grabbedCard = extractCardById(nextState, entityId);
        assert.equal(grabbedCard.grabbedBy, client.clientInfo.clientId);
    })
})
