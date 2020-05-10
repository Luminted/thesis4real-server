import * as assert from 'assert'
import produce from 'immer';

import { handleGrab } from "./handleGrabFromTable";
import { SharedVerbTypes, SharedVerb } from "../../../../types/verbTypes";
import { EntityTypes, GameState, Client, CardTypes } from "../../../../types/dataModelDefinitions";
import { extractGrabbedEntityOfClientById, extractCardById, extractDeckById } from "../../../../extractors/gameStateExtractors";
import { clientFactory, cardFactory, deckFactory } from '../../../../factories';
import {initialGameState} from '../../../../mocks/initialGameState'




describe(`handle ${SharedVerbTypes.GRAB_FROM_TABLE} verb`, function() {
    let gameState: GameState;
    let client: Client = clientFactory('socket-1');
    const freeCard = cardFactory(0,0,CardTypes.FRENCH);
    const grabbedCard = cardFactory(0,0,CardTypes.FRENCH);
    const freeDeck = deckFactory(CardTypes.FRENCH, 0,0);
    const grabbedDeck = deckFactory(CardTypes.FRENCH, 0,0);
    grabbedCard.grabbedBy = client.clientInfo.clientId;
    grabbedDeck.grabbedBy = client.clientInfo.clientId;

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards.set(freeCard.entityId, freeCard);
            draft.cards.set(grabbedCard.entityId, grabbedCard);
            draft.decks.set(freeDeck.entityId, freeDeck);
            draft.decks.set(grabbedDeck.entityId, grabbedDeck);
            draft.clients.set(client.clientInfo.clientId, client);
        })
    })

    const testedVerbType = SharedVerbTypes.GRAB_FROM_TABLE;
    describe(`EntityType: ${EntityTypes.CARD}`, function(){
        it('Assignes data of clicked card to correct clients grabbedEntity.', function(){
            const {entityId, entityType} = freeCard;
            const positionX = 1;
            const positionY = 2;
            const verb: SharedVerb = {
                type: testedVerbType,
                clientId: client.clientInfo.clientId,
                positionX: positionX,
                positionY,
                entityId,
                entityType
            }
            const nextState = handleGrab(gameState,verb);
            const grabbedEntity = extractGrabbedEntityOfClientById(nextState, verb.clientId);
            assert.equal(grabbedEntity.entityId, entityId);
            assert.equal(grabbedEntity.grabbedAtX, positionX);
            assert.equal(grabbedEntity.grabbedAtY, positionY);
        });

        it('should set grabbedBy to clients ID', function(){
            const {entityId, entityType} = freeCard;
            const positionX = 1;
            const positionY = 2;
            const verb: SharedVerb = {
                type: testedVerbType,
                clientId: client.clientInfo.clientId,
                positionX: positionX,
                positionY,
                entityId,
                entityType
            }

            const nextState = handleGrab(gameState, verb);
            const nextCard = extractCardById(nextState, entityId);
            assert.equal(nextCard.grabbedBy, client.clientInfo.clientId);
        })
        it('should do nothing if card is grabbed', function(){
            const {entityId, entityType} = grabbedCard;
            const positionX = 1;
            const positionY = 2;
            const verb: SharedVerb = {
                type: testedVerbType,
                clientId: client.clientInfo.clientId,
                positionX: positionX,
                positionY,
                entityId,
                entityType
            }

            const nextState = handleGrab(gameState, verb);
            assert.deepEqual(nextState, gameState);
        })
    })

    describe(`EntityType: ${EntityTypes.DECK}`, function(){
        it('Assignes data of clicked card to correct clients grabbedEntity.', function(){
            const {entityType, entityId } = freeDeck;
            const positionX = 1;
            const positionY = 2;
            const verb: SharedVerb = {
                type: testedVerbType,
                clientId: client.clientInfo.clientId,
                positionX: positionX,
                positionY,
                entityId,
                entityType
            }
            const nextState = handleGrab(gameState,verb);
            const grabbedEntity = extractGrabbedEntityOfClientById(nextState, verb.clientId);
            assert.equal(grabbedEntity.entityId, entityId);
            assert.equal(grabbedEntity.grabbedAtX, positionX);
            assert.equal(grabbedEntity.grabbedAtY, positionY);
        })

        it('should set grabbedBy to clients ID', function(){
            const {entityId, entityType} = freeDeck;
            const positionX = 1;
            const positionY = 2;
            const verb: SharedVerb = {
                type: testedVerbType,
                clientId: client.clientInfo.clientId,
                positionX: positionX,
                positionY,
                entityId,
                entityType
            }

            const nextState = handleGrab(gameState, verb);
            const nextDeck = extractDeckById(nextState, entityId);
            assert.equal(nextDeck.grabbedBy, client.clientInfo.clientId);
        })
        it('should do nothing if deck isgrabbed', function(){
            const {entityId, entityType} = grabbedDeck;
            const positionX = 1;
            const positionY = 2;
            const verb: SharedVerb = {
                type: testedVerbType,
                clientId: client.clientInfo.clientId,
                positionX: positionX,
                positionY,
                entityId,
                entityType
            }

            const nextState = handleGrab(gameState, verb);
            assert.deepEqual(nextState, gameState);
        })
    })
})