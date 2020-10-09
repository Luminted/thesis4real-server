import assert from "assert";
import {Container} from "typescript-ioc";
import { extractCardById, extractDeckById } from "../../../../extractors/gameStateExtractors";
import { mockClient1 } from "../../../../mocks/clientMocks";
import { deckEntityMock1 } from "../../../../mocks/entityMocks";
import { TableStateStore } from "../../../../stores/TableStateStore/TableStateStore";
import { DeckVerb, DeckVerbTypes } from "../../../../types/verbTypes";
import { DeckVerbHandler } from "../DeckVerbHandler";

describe(`handle ${DeckVerbTypes.DRAW_FACE_UP}`, () => {
    const deckVerbHandler = new DeckVerbHandler();
    const {gameStateStore} = Container.get(TableStateStore).state;
    const {entityId, entityType} = deckEntityMock1;
    const {clientId} = mockClient1.clientInfo;
    const verb: DeckVerb = {
        entityId,
        entityType,
        clientId,
        type: DeckVerbTypes.DRAW_FACE_DOWN,
        positionX: 0,
        positionY: 0
    } 

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.decks.set(entityId, {...deckEntityMock1});
            draft.clients.set(clientId, {...mockClient1});
        })
    })


    it("should spawn a card entity with faceUp false", () => {
        const nextGameState = deckVerbHandler.drawCard(verb, false);

        const {cards, drawIndex} = deckEntityMock1;
        const {faceUp} = extractCardById(nextGameState, cards[drawIndex].entityId);
        assert.equal(faceUp, false);
    })

    it('should spawn a card directly on top of the deck', function() {
        const nextGameState = deckVerbHandler.drawCard(verb, false);

        const {cards, drawIndex} = deckEntityMock1;
        const {faceUp} = extractCardById(nextGameState, cards[drawIndex].entityId);
        assert.equal(faceUp, false);
    })
    it('should spawn a card entity with the decks ID as ownerDeck', function() {
        const nextGameState = deckVerbHandler.drawCard(verb, false); 

        const {cards, drawIndex} = deckEntityMock1;
        const {positionX, positionY} = extractCardById(nextGameState, cards[drawIndex].entityId);
        assert.equal(positionX, deckEntityMock1.positionX);
        assert.equal(positionY, deckEntityMock1.positionY);
    })
    it('should increase the decks drawIndex by 1', function() {
        const nextGameState = deckVerbHandler.drawCard(verb, false); 

        const {drawIndex} = extractDeckById(nextGameState, deckEntityMock1.entityId);
        assert.equal(drawIndex, deckEntityMock1.drawIndex + 1);
    })
    it('should spawn card with same rotation as deck', ()=>{
        const nextGameState = deckVerbHandler.drawCard(verb, false); 

        const {cards, drawIndex, rotation: deckRotation} = deckEntityMock1;
        const {rotation: cardRotation} = extractCardById(nextGameState, cards[drawIndex].entityId);
        assert.equal(cardRotation, deckRotation);
    })
})