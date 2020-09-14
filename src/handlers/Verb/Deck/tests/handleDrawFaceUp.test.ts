import * as assert from 'assert';
import { DeckVerbTypes, DeckVerb } from '../../../../types/verbTypes';
import { CardRepresentation, CardTypes, DeckEntity } from '../../../../types/dataModelDefinitions';
import { deckFactory } from '../../../../factories';
import { extractCardById, extractDeckById } from '../../../../extractors/gameStateExtractors';
import { client1 } from '../../../../mocks/client';
import { DeckVerbHandler } from '../DeckVerbHandler';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';
import { Container } from 'typescript-ioc';

describe(`handle ${DeckVerbTypes.DRAW_FACE_UP} verb`, function() {
    const deckVerbHandler = new DeckVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
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
        
        const nextGameState = deckVerbHandler.drawFaceUp(verb);

        const drawnCard: CardRepresentation = deck.cards[originalDrawIndex];
        const spawnedCard = extractCardById(nextGameState, drawnCard.entityId);
        const nextDeck = extractDeckById(nextGameState, deck.entityId);
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
        
        const nextGameState = deckVerbHandler.drawFaceUp(verb);

        const poppedCard: CardRepresentation = originalDeck.cards[0];
        const spawnedCard = extractCardById(nextGameState, poppedCard.entityId);

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
        
        const nextGameState = deckVerbHandler.drawFaceUp(verb);

        const nextDeck = extractDeckById(nextGameState, deck.entityId);
        assert.notDeepEqual(originalState, nextGameState)
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
        
        const nextGameState = deckVerbHandler.drawFaceUp(verb);

        assert.equal(extractDeckById(nextGameState, deck.entityId).cards.length, deck.cards.length);
    })
})