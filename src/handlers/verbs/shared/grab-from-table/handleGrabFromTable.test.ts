import * as assert from 'assert'
import produce, { enableMapSet } from 'immer';

import { handleGrab } from "./handleGrabFromTable";
import { SharedVerbTypes, SharedVerb } from "../../../../types/verbTypes";
import { EntityTypes, GameState, Client, CardTypes } from "../../../../types/dataModelDefinitions";
import { extractGrabbedEntityOfClientById, extractEntityByTypeAndId } from "../../../../extractors/gameStateExtractors";
import { clientFactory, cardFactory, deckFactory } from '../../../../factories';
import {initialGameState} from '../../../../mocks/initialGameState'
import { gameConfig } from '../../../../config';

describe(`handle ${SharedVerbTypes.GRAB_FROM_TABLE} verb`, function() {

    enableMapSet()

    let gameState: GameState;
    let client: Client = clientFactory('socket-1');
    const freeCard = cardFactory(0,0,CardTypes.FRENCH);
    const grabbedCard = cardFactory(0,0,CardTypes.FRENCH);
    const verb: SharedVerb = {
        type: SharedVerbTypes.GRAB_FROM_TABLE,
        clientId: client.clientInfo.clientId,
        positionX: 0,
        positionY: 1,
        entityId: freeCard.entityId,
        entityType: freeCard.entityType
    }
    grabbedCard.grabbedBy = client.clientInfo.clientId;

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards.set(freeCard.entityId, freeCard);
            draft.cards.set(grabbedCard.entityId, grabbedCard);
            draft.clients.set(client.clientInfo.clientId, client);
        })
    })

        it('Assignes data of clicked card to correct clients grabbedEntity.', function(){
            const {entityId} = freeCard;
            const {positionX, positionY} = verb;
            const nextState = handleGrab(gameState,verb);
            const grabbedEntity = extractGrabbedEntityOfClientById(nextState, verb.clientId);
            assert.equal(grabbedEntity.entityId, entityId);
            assert.equal(grabbedEntity.grabbedAtX, positionX);
            assert.equal(grabbedEntity.grabbedAtY, positionY);
        });

        it('should set grabbedBy to clients ID', function(){
            const {entityId, entityType} = freeCard;
            const nextState = handleGrab(gameState, verb);
            const nextCard = extractEntityByTypeAndId(nextState, entityType, entityId);
            assert.equal(nextCard.grabbedBy, client.clientInfo.clientId);
        })
        it('should do nothing if card is grabbed', function(){
            const {entityId, entityType} = grabbedCard;
            const positionX = 1;
            const positionY = 2;
            const verb: SharedVerb = {
                type: SharedVerbTypes.GRAB_FROM_TABLE,
                clientId: client.clientInfo.clientId,
                positionX: positionX,
                positionY,
                entityId,
                entityType
            }

            const nextState = handleGrab(gameState, verb);
            assert.deepEqual(nextState, gameState);
        })
        it('should set entities z-index to topZIndex + 1', function(){
            const {entityId, entityType} = freeCard;
            const nextState = handleGrab(gameState,verb);
            const nextCard = extractEntityByTypeAndId(nextState, entityType, entityId);
            assert.equal(nextCard.zIndex, gameState.topZIndex + 1);
        })
        it('should reset z-indexes if topZIndex reaches limit', function(){
            const deck = deckFactory(CardTypes.FRENCH, 0, 0);
            gameState = produce(gameState, draft => {
                draft.topZIndex = gameConfig.zIndexLimit;
                deck.zIndex = gameConfig.zIndexLimit - 1;
                draft.decks.set(deck.entityId, deck);
                extractEntityByTypeAndId(draft, freeCard.entityType, freeCard.entityId).zIndex = gameConfig.zIndexLimit;
            })
            const nextGameState = handleGrab(gameState, verb);
            const nextCard = extractEntityByTypeAndId(nextGameState, freeCard.entityType, freeCard.entityId);
            const nextDeck = extractEntityByTypeAndId(nextGameState, deck.entityType, deck.entityId);
            assert.equal(nextCard.zIndex, 2);
            assert.equal(nextDeck.zIndex, 1);
        })
        it('should increment topZIndex by one', function(){
            const nextGameState = handleGrab(gameState, verb);
            assert.equal(nextGameState.topZIndex, gameState.topZIndex + 1);
        })
        it('should set topZIndex to the number of entities minus 1 if z-index limit is reached', function(){
            let numberOfEntities = 15;
            const gameState = produce(initialGameState, draft => {
                draft.clients.set(client.clientInfo.clientId, client);
                for(let i =0; i < numberOfEntities; i++){
                    const newEntity = cardFactory(0,0,CardTypes.FRENCH);
                    draft.cards.set(newEntity.entityId, newEntity);
                    draft.topZIndex = gameConfig.zIndexLimit;
                }
                draft.cards.set(freeCard.entityId, freeCard);
                numberOfEntities++;
            })
            const nextGameState = handleGrab(gameState, verb);
            assert.equal(nextGameState.topZIndex, numberOfEntities - 1);
        })
    })