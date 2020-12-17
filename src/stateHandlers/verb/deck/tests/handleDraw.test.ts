import assert from 'assert';
import cloneDeep from "lodash.clonedeep";
import { EDeckVerbTypes, IDrawFaceUpVerb, IDeckCard } from '../../../../typings';
import { extractCardById, extractDeckById } from '../../../../extractors';
import { mockClient1, deckEntityMock1 } from '../../../../mocks';
import { DeckVerbHandler } from '../DeckVerbHandler';
import { Container } from "typescript-ioc";
import { GameStateStore } from '../../../../stores';

describe(`handle ${EDeckVerbTypes.DRAW_FACE_UP} and ${EDeckVerbTypes.DRAW_FACE_DOWN} verb`, () => {
    const deckVerbHandler = new DeckVerbHandler();
    const gameStateStore = Container.get(GameStateStore)
    const {clientInfo: {clientId}} = mockClient1;
    const {entityId} = deckEntityMock1;
    const rotation = 12;
    const deck = {...deckEntityMock1, positionX: 10, positionY: 12, rotation};
    const verb: IDrawFaceUpVerb = {
        type: EDeckVerbTypes.DRAW_FACE_UP,
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
        deckVerbHandler.drawCard(verb, true);

        const {faceUp} = extractCardById(gameStateStore.state, deck.cards[deck.drawIndex].entityId);
        assert.equal(faceUp, true);
    })

    it('should spawn a card directly on top of the deck', () => {
        const originalDrawIndex = deck.drawIndex;
        
        deckVerbHandler.drawCard(verb, true);

        const drawnCard: IDeckCard = deck.cards[originalDrawIndex];
        const spawnedCard = extractCardById(gameStateStore.state, drawnCard.entityId);
        assert.equal(spawnedCard.positionX, deck.positionX);
        assert.equal(spawnedCard.positionY, deck.positionY);
    })

    it('should spawn a card entity with the decks ID as ownerDeck', () => {
        const originalDeck = deck;
        
        deckVerbHandler.drawCard(verb, true);

        const poppedCard: IDeckCard = originalDeck.cards[0];
        const spawnedCard = extractCardById(gameStateStore.state, poppedCard.entityId);

        assert.equal(spawnedCard.ownerDeck, originalDeck.entityId);
    })
    it('should increase the decks drawIndex by 1', () => {
        const originalState = cloneDeep(gameStateStore.state);
        
        deckVerbHandler.drawCard(verb, true);

        const gameState = gameStateStore.state;
        const nextDeck = extractDeckById(gameState, deck.entityId);
        assert.notDeepEqual(originalState, gameState)
        assert.equal(nextDeck.drawIndex, deck.drawIndex + 1);
    })
    it('should spawn card with same rotation as deck', ()=>{
        deckVerbHandler.drawCard(verb, true);
        
        const gameState = gameStateStore.state;
        const {drawIndex, cards} = extractDeckById(gameState, entityId); 
        const {entityId: drawnCardId} = cards[drawIndex - 1];
        const card = extractCardById(gameState, drawnCardId);

        assert.equal(card.rotation, rotation);
    })
    it("should throw error if deck is empty", () => {
        gameStateStore.changeState(draft => {
            draft.decks.set(entityId, {...deckEntityMock1, cards: [], drawIndex: 0, numberOfCards: 0})
        })

        assert.throws(() => deckVerbHandler.drawCard(verb, true));
    })
})