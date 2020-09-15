import assert from 'assert';
import { DeckVerbTypes, DeckVerb } from '../../../../types/verbTypes';
import { CardRepresentation } from '../../../../types/dataModelDefinitions';
import { extractCardById, extractDeckById } from '../../../../extractors/gameStateExtractors';
import { client1 } from '../../../../mocks/client';
import { DeckVerbHandler } from '../DeckVerbHandler';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';
import { Container } from 'typescript-ioc';
import { deckEntityMock } from '../../../../mocks/entity';

describe(`handle ${DeckVerbTypes.DRAW_FACE_UP} verb`, function() {
    const deckVerbHandler = new DeckVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const {clientInfo: {clientId}} = client1;
    const {entityId, entityType} = deckEntityMock;
    const rotation = 12;
    const deck = {...deckEntityMock, positionX: 10, positionY: 12, rotation};
    const verb: DeckVerb = {
        type: DeckVerbTypes.DRAW_FACE_UP,
        clientId: clientId,
        positionX: 0,
        positionY: 0,
        entityId: entityId,
        entityType: entityType,
    }

    beforeEach('Setting up test data...', () => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.decks.set(deck.entityId, deck);
            draft.clients.set(clientId, client1);
        })
    })

    it('should spawn a card directly on top of the deck', function() {
        const originalDrawIndex = deck.drawIndex;
        
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

    it('should the decks entityId as owner of spawned card', function() {
        const originalDeck = deck;
        const verb: DeckVerb = {
            type: DeckVerbTypes.DRAW_FACE_UP,
            clientId: clientId,
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
    it('should increase the decks drawIndex by 1', function() {
        const originalState = {...gameStateStore.state};
        
        const nextGameState = deckVerbHandler.drawFaceUp(verb);

        const nextDeck = extractDeckById(nextGameState, deck.entityId);
        assert.notDeepEqual(originalState, nextGameState)
        assert.equal(nextDeck.drawIndex, deck.drawIndex + 1);
    })
    it('should spawn card with same rotation as deck', ()=>{
        const nextGameState = deckVerbHandler.drawFaceUp(verb);
        
        const {drawIndex, cards} = extractDeckById(nextGameState, entityId); 
        const {entityId: drawnCardId} = cards[drawIndex - 1];
        const card = extractCardById(nextGameState, drawnCardId);

        assert.equal(card.rotation, rotation);
    })

})