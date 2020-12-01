import assert from 'assert';
import { DeckVerbTypes, IDrawFaceUpVerb, DeckCard } from '../../../../typings';
import { extractCardById, extractDeckById } from '../../../../extractors/gameStateExtractors';
import { mockClient1 } from '../../../../mocks/clientMocks';
import { DeckVerbHandler } from '../DeckVerbHandler';
import { TableStateStore } from '../../../../stores/TableStateStore/TableStateStore';
import { Container } from 'typescript-ioc';
import { deckEntityMock1 } from '../../../../mocks/entityMocks';

describe(`handle ${DeckVerbTypes.DRAW_FACE_UP} verb`, () => {
    const deckVerbHandler = new DeckVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const {clientInfo: {clientId}} = mockClient1;
    const {entityId, entityType} = deckEntityMock1;
    const rotation = 12;
    const deck = {...deckEntityMock1, positionX: 10, positionY: 12, rotation};
    const verb: IDrawFaceUpVerb = {
        type: DeckVerbTypes.DRAW_FACE_UP,
        entityId: entityId,
    }

    beforeEach('Setting up test data...', () => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.decks.set(deck.entityId, deck);
            draft.clients.set(clientId, {...mockClient1});
        })
    })

    it("should spawn a card with faceUp true", () => {
        const nextGameState = deckVerbHandler.drawCard(verb, true);

        const {faceUp} = extractCardById(nextGameState, deck.cards[deck.drawIndex].entityId);
        assert.equal(faceUp, true);
    })

    it('should spawn a card directly on top of the deck', () => {
        const originalDrawIndex = deck.drawIndex;
        
        const nextGameState = deckVerbHandler.drawCard(verb, true);

        const drawnCard: DeckCard = deck.cards[originalDrawIndex];
        const spawnedCard = extractCardById(nextGameState, drawnCard.entityId);
        assert.equal(spawnedCard.positionX, deck.positionX);
        assert.equal(spawnedCard.positionY, deck.positionY);
    })

    it('should spawn a card entity with the decks ID as ownerDeck', () => {
        const originalDeck = deck;
        
        const nextGameState = deckVerbHandler.drawCard(verb, true);

        const poppedCard: DeckCard = originalDeck.cards[0];
        const spawnedCard = extractCardById(nextGameState, poppedCard.entityId);

        assert.equal(spawnedCard.ownerDeck, originalDeck.entityId);
    })
    it('should increase the decks drawIndex by 1', () => {
        const originalState = {...gameStateStore.state};
        
        const nextGameState = deckVerbHandler.drawCard(verb, true);

        const nextDeck = extractDeckById(nextGameState, deck.entityId);
        assert.notDeepEqual(originalState, nextGameState)
        assert.equal(nextDeck.drawIndex, deck.drawIndex + 1);
    })
    it('should spawn card with same rotation as deck', ()=>{
        const nextGameState = deckVerbHandler.drawCard(verb, true);
        
        const {drawIndex, cards} = extractDeckById(nextGameState, entityId); 
        const {entityId: drawnCardId} = cards[drawIndex - 1];
        const card = extractCardById(nextGameState, drawnCardId);

        assert.equal(card.rotation, rotation);
    })

})