import * as assert from 'assert'

import { handleGrab } from "./handleGrabFromTable";
import { SharedVerbTypes, SharedVerb } from "../../../../types/verbTypes";
import { EntityTypes, GameState, Client, CardTypes } from "../../../../types/dataModelDefinitions";
import { extractGrabbedEntityOfClientById, extractCardById, extractDeckById } from "../../../../extractors/gameStateExtractors";
import { clientFactory, cardFactory, deckFactory } from '../../../../factories';
import produce from 'immer';
import {initialGameState} from '../../../../__mocks__/initialGameState'




describe(`handle ${SharedVerbTypes.GRAB_FROM_TABLE} verb`, function() {
    let gameState: GameState;
    let client: Client;
    const freeCard = cardFactory(0,0,CardTypes.FRENCH);
    const lockedCard = cardFactory(0,0,CardTypes.FRENCH);
    const freeDeck = deckFactory(CardTypes.FRENCH, 0,0);
    const lockedDeck = deckFactory(CardTypes.FRENCH, 0,0);
    lockedCard.grabLocked = true;
    lockedDeck.grabLocked = true;

    beforeEach('Setting up test data...', () => {
        client = clientFactory('socket-1');
        gameState = produce(initialGameState, draft => {
            draft.cards = [freeCard, lockedCard];
            draft.decks = [freeDeck, lockedDeck];
            draft.clients = [client]
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

        it('should lock grabbed card', function(){
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
            assert.equal(nextCard.grabLocked, true);
        })
        it('should do nothing if card is locked', function(){
            const {entityId, entityType} = lockedCard;
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

        it('should lock grabbed deck', function(){
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
            assert.equal(nextDeck.grabLocked, true);
        })
        it('should do nothing if deck is locked', function(){
            const {entityId, entityType} = lockedDeck;
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