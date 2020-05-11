import * as assert from 'assert';

import { CardVerbTypes, CardVerb } from "../../../../types/verbTypes";
import { GameState, GrabbedEntity, EntityTypes, CardTypes } from "../../../../types/dataModelDefinitions";
import { clientFactory, cardFactory, deckFactory, clientHandFactory, cardRepFactory } from "../../../../factories";
import produce, { enableMapSet } from "immer";
import { initialGameState } from "../../../../mocks/initialGameState";
import { handleGrabFromHand } from "./handleGrabFromHand";
import { extractClientById, extractCardById, extractGrabbedEntityOfClientById, extractClientHandById, extractDeckById } from '../../../../extractors/gameStateExtractors';
import { cardConfigLookup, gameConfig } from '../../../../config';

describe(`handle ${CardVerbTypes.GRAB_FROM_HAND} verb`, function() {
    enableMapSet();

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

    it('should set grabbedBy of grabbed card to client ID', function(){
        const {entityId} = cardToGrab;
        const nextState = handleGrabFromHand(gameState, verb);
        const grabbedCard = extractCardById(nextState, entityId);
        assert.equal(grabbedCard.grabbedBy, client.clientInfo.clientId);
    })

    it('should set z-index of grabbed card to topZIndex + 1', function(){
        const nextState = handleGrabFromHand(gameState, verb);
        const grabbedCard = extractCardById(nextState, verb.entityId);
        assert.notEqual(grabbedCard.zIndex, gameState.topZIndex + 1);
    })

    it('should increment topZIndex by one', function(){
        const nextGameState = handleGrabFromHand(gameState, verb);
        assert.equal(nextGameState.topZIndex, gameState.topZIndex + 1);
    })

    it('should set topZIndex to the number of entities minus 1 in state if z-index limit is reached', function(){
        const numberOfEntities = 15;
        gameState = produce(gameState, draft => {
            draft.topZIndex = gameConfig.zIndexLimit;
            for(let i =0; i < numberOfEntities; i++){
                const newCard = cardFactory(0,0,CardTypes.FRENCH);
                draft.cards.set(newCard.entityId, newCard);
            }
        })

        const nextGameState = handleGrabFromHand(gameState, verb);
        assert.equal(nextGameState.topZIndex, numberOfEntities - 1);
    });

    it('should reset z-indexes if topZIndex reaches limit', function(){
        const deck = deckFactory(CardTypes.FRENCH, 0, 0);
        const card = cardFactory(0,0,CardTypes.FRENCH);
        gameState = produce(gameState, draft => {
            draft.topZIndex = gameConfig.zIndexLimit;
            card.zIndex = gameConfig.zIndexLimit;
            deck.zIndex = gameConfig.zIndexLimit - 1;
            draft.decks.set(deck.entityId, deck);
            draft.cards.set(card.entityId, card);
            extractCardById(draft, card.entityId).zIndex = gameConfig.zIndexLimit;
        })
        const nextGameState = handleGrabFromHand(gameState, verb);
        const nextCard = extractCardById(nextGameState, card.entityId);
        const nextDeck = extractDeckById(nextGameState, deck.entityId);
        assert.equal(nextCard.zIndex, 1);
        assert.equal(nextDeck.zIndex, 0);
    })
})
