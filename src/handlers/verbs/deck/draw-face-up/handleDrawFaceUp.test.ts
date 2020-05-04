import * as assert from 'assert';
import produce from 'immer';

import { handleDrawFaceUp } from './handleDrawFaceUp'
import { DeckVerbTypes, DeckVerb } from '../../../.././types/verbTypes';
import { GameState, BaseCard, CardTypes } from '../../../.././types/dataModelDefinitions';
import { clientFactory, cardFactory, deckFactory } from '../../../../factories';
import {initialGameState} from '../../../../__mocks__/initialGameState'
import { extractCardById, extractDeckById } from '../../../../extractors/gameStateExtractors';

describe(`handle ${DeckVerbTypes.DRAW_FACE_UP} verb`, function() {

    let gameState: GameState;
    let client = clientFactory('socket-1');

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards = [cardFactory(0,0, CardTypes.FRENCH), cardFactory(0,100, CardTypes.FRENCH), cardFactory(100,0, CardTypes.FRENCH)]
            draft.decks = [deckFactory(CardTypes.FRENCH, 10,12)]
            draft.clients.push(client);
            draft.hands
        })
    })

    const testedVerbType = DeckVerbTypes.DRAW_FACE_UP; 
    it('should spawn a card directly on top of the deck', function() {
        const originalDeck = gameState.decks[0];
        const originalDrawIndex = originalDeck.drawIndex;
        const verb: DeckVerb = {
            type: testedVerbType,
            clientId: client.clientInfo.clientId,
            positionX: 0,
            positionY: 0,
            entityId: originalDeck.entityId,
            entityType: originalDeck.entityType,
        }
        const nextGameState = handleDrawFaceUp(gameState, verb);
        const poppedCard: BaseCard = originalDeck.cards[originalDrawIndex];
        const spawnedCard = extractCardById(nextGameState, poppedCard.entityId);
        const nextDeck = extractDeckById(nextGameState, originalDeck.entityId);
        assert.notEqual(spawnedCard, undefined);
        assert.equal(spawnedCard.entityId ,poppedCard.entityId);
        assert.notEqual(poppedCard.entityId, nextDeck.cards[nextDeck.drawIndex].entityId);
        assert.equal(spawnedCard.positionX, originalDeck.positionX);
        assert.equal(spawnedCard.positionY, originalDeck.positionY);
        assert.equal(spawnedCard.faceUp, true);
    })

    it('should set correct decks entityId to spawned card', function() {
        const originalDeck = gameState.decks[0];
        const verb: DeckVerb = {
            type: testedVerbType,
            clientId: client.clientInfo.clientId,
            positionX: 0,
            positionY: 0,
            entityId: originalDeck.entityId,
            entityType: originalDeck.entityType,
        }
        const nextGameState = handleDrawFaceUp(gameState, verb);
        const poppedCard: BaseCard = originalDeck.cards[0];
        const spawnedCard = extractCardById(nextGameState, poppedCard.entityId);

        assert.equal(spawnedCard.ownerDeck, originalDeck.entityId);
    })
    it('should increase correct decks drawIndex by 1', function() {
        const originalDeck = gameState.decks[0];
        const verb: DeckVerb = {
            type: testedVerbType,
            clientId: client.clientInfo.clientId,
            positionX: 0,
            positionY: 0,
            entityId: originalDeck.entityId,
            entityType: originalDeck.entityType,
        }
        const nextGameState = handleDrawFaceUp(gameState, verb);
        const nextDeck = extractDeckById(nextGameState, originalDeck.entityId);

        assert.equal(nextDeck.drawIndex, originalDeck.drawIndex + 1);
    })


})