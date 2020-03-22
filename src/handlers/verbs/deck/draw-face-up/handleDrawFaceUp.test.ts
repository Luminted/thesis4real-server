import * as assert from 'assert';
import produce from 'immer';

import { handleDrawFaceUp } from './handleDrawFaceUp'
import { DeckVerbTypes, DeckVerb } from '../../../../../../common/verbTypes';
import { GameState, BaseCard } from '../../../../../../common/dataModelDefinitions';
import { clientFactory, cardFactory, deckFactory } from '../../../../factories';
import { extractCardById, extractDeckById } from '../../../../extractors';

describe(`handle ${DeckVerbTypes.DRAW_FACE_UP} verb`, function() {
    let initialGameState: GameState = {
        cards: [],
        decks: [],
        clients: []
    };
    let gameState: GameState;
    let client = clientFactory();

    beforeEach('Setting up test data...', () => {
        gameState = produce(initialGameState, draft => {
            draft.cards = [cardFactory(0,0), cardFactory(0,100), cardFactory(100,0)]
            draft.decks = [deckFactory(10,12)]
            draft.clients.push(client);
        })
    })

    const testedVerbType = DeckVerbTypes.DRAW_FACE_UP; 
    it('should spawn a card directly on top of the deck', function() {
        const originalDeck = gameState.decks[0];
        const originalDrawIndex = originalDeck.drawIndex;
        const verb: DeckVerb = {
            type: testedVerbType,
            clientId: client.clientInfo.clientId,
            cursorX: 0,
            cursorY: 0,
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
        assert.equal(spawnedCard.turnedUp, true);
    })

    it('should set correct decks entityId to spawned card', function() {
        const originalDeck = gameState.decks[0];
        const verb: DeckVerb = {
            type: testedVerbType,
            clientId: client.clientInfo.clientId,
            cursorX: 0,
            cursorY: 0,
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
            cursorX: 0,
            cursorY: 0,
            entityId: originalDeck.entityId,
            entityType: originalDeck.entityType,
        }
        const nextGameState = handleDrawFaceUp(gameState, verb);
        const nextDeck = extractDeckById(nextGameState, originalDeck.entityId);

        assert.equal(nextDeck.drawIndex, originalDeck.drawIndex + 1);
    })


})