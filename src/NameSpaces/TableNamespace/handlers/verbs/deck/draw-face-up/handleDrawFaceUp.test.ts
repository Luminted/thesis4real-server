import * as assert from 'assert';
import { handleDrawFaceUp } from './handleDrawFaceUp'
import { DeckVerbTypes, DeckVerb } from '../../../../../../types/verbTypes';
import { CardRepresentation, CardTypes, DeckEntity } from '../../../../../../types/dataModelDefinitions';
import { deckFactory } from '../../../../../../factories';
import { extractCardById, extractDeckById } from '../../../../../../extractors/gameStateExtractors';
import { client1 } from '../../../../../../mocks/client';
import { GameStateStore } from '../../../../../../Store/GameStateStore';

describe(`handle ${DeckVerbTypes.DRAW_FACE_UP} verb`, function() {

    let gameStateStore = new GameStateStore();
    let client = client1;
    let deck: DeckEntity;

    beforeEach('Setting up test data...', () => {
        deck = deckFactory(CardTypes.FRENCH, 10,12);
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.decks.set(deck.entityId, deck);
            draft.clients.set(client.clientInfo.clientId, client);
        })
    })

    const testedVerbType = DeckVerbTypes.DRAW_FACE_UP; 
    it('should spawn a card directly on top of the deck', function() {
        const originalDrawIndex = deck.drawIndex;
        const verb: DeckVerb = {
            type: testedVerbType,
            clientId: client.clientInfo.clientId,
            positionX: 0,
            positionY: 0,
            entityId: deck.entityId,
            entityType: deck.entityType,
        }
        gameStateStore.changeState(draft => handleDrawFaceUp(draft, verb));
        const drawnCard: CardRepresentation = deck.cards[originalDrawIndex];
        const spawnedCard = extractCardById(gameStateStore.state, drawnCard.entityId);
        const nextDeck = extractDeckById(gameStateStore.state, deck.entityId);
        assert.notEqual(spawnedCard, undefined);
        assert.equal(spawnedCard.entityId ,drawnCard.entityId);
        assert.notEqual(drawnCard.entityId, nextDeck.cards[nextDeck.drawIndex].entityId);
        assert.equal(spawnedCard.positionX, deck.positionX);
        assert.equal(spawnedCard.positionY, deck.positionY);
        assert.equal(spawnedCard.faceUp, true);
    })

    it('should set correct decks entityId as owner of spawned card', function() {
        const originalDeck = deck;
        const verb: DeckVerb = {
            type: testedVerbType,
            clientId: client.clientInfo.clientId,
            positionX: 0,
            positionY: 0,
            entityId: originalDeck.entityId,
            entityType: originalDeck.entityType,
        }
        gameStateStore.changeState(draft => handleDrawFaceUp(draft, verb));
        const poppedCard: CardRepresentation = originalDeck.cards[0];
        const spawnedCard = extractCardById(gameStateStore.state, poppedCard.entityId);

        assert.equal(spawnedCard.ownerDeck, originalDeck.entityId);
    })
    it('should increase correct decks drawIndex by 1', function() {
        const originalState = {...gameStateStore.state};
        const verb: DeckVerb = {
            type: testedVerbType,
            clientId: client.clientInfo.clientId,
            positionX: 0,
            positionY: 0,
            entityId: deck.entityId,
            entityType: deck.entityType,
        }
        gameStateStore.changeState(draft => handleDrawFaceUp(draft, verb));
        const nextDeck = extractDeckById(gameStateStore.state, deck.entityId);
        assert.notDeepEqual(originalState, gameStateStore.state)
        assert.equal(nextDeck.drawIndex, deck.drawIndex + 1);
    })
    it('should not remove cards from deck', function(){
        const verb: DeckVerb = {
            type: testedVerbType,
            clientId: client.clientInfo.clientId,
            positionX: 0,
            positionY: 0,
            entityId: deck.entityId,
            entityType: deck.entityType,
        }
        gameStateStore.changeState(draft => handleDrawFaceUp(draft, verb));
        assert.equal(extractDeckById(gameStateStore.state, deck.entityId).cards.length, deck.cards.length);
    })
})