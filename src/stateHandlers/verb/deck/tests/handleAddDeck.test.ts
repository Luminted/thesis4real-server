import assert from "assert";
import {Container} from "typescript-ioc";
import { mockClient1 } from "../../../../mocks";
import { GameStateStore } from "../../../../stores";
import { EDeckVerbTypes, IAddDeckVerb } from "../../../../typings";
import { DeckVerbHandler } from "..";

describe(`Hander for ${EDeckVerbTypes.ADD_DECK} verb`, () => {
    const deckVerbHandler = new DeckVerbHandler();
    const gameStateStore = Container.get(GameStateStore);
    const {clientInfo: {clientId}} = mockClient1;
    const verb: IAddDeckVerb = {
        type: EDeckVerbTypes.ADD_DECK,
        positionX: 14,
        positionY: 77,
        rotation: 34,
        metadata: {
            data: "info"
        },
        containedCardsMetadata: [{data: "card_info"}]
    }

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.clients.set(clientId, {...mockClient1});
        })
    })

    it("should add a deck entity with parameters described in verb", () => {
        const newDeckEntityId = deckVerbHandler.addDeck(verb);

        const addedDeck = gameStateStore.state.decks.get(newDeckEntityId);
        assert.equal(addedDeck.positionX, verb.positionX);
        assert.equal(addedDeck.positionY, verb.positionY);
        assert.equal(addedDeck.rotation, verb.rotation);
        assert.deepEqual(addedDeck.metadata, verb.metadata);
        assert.deepEqual(addedDeck.cards.map(({metadata}) => ({...metadata}) ), verb.containedCardsMetadata);
    })

    it("should add deck entity with top z index", () => {
        const newDeckEntityId = deckVerbHandler.addDeck(verb);
        
        const addedDeck = gameStateStore.state.decks.get(newDeckEntityId);
        assert.equal(addedDeck.zIndex, gameStateStore.state.topZIndex);
    })

    it("should add card entity with grabbedBy as null", () => {
        const newDeckEntityId = deckVerbHandler.addDeck(verb);

        const addedDeck = gameStateStore.state.decks.get(newDeckEntityId);
        assert.equal(addedDeck.grabbedBy, null);
    })

    it("should initialize numberOfCards to number of cards contained", () => {
        const newDeckEntityId = deckVerbHandler.addDeck(verb);

        const {numberOfCards, cards} = gameStateStore.state.decks.get(newDeckEntityId);
        assert.equal(numberOfCards, cards.length);
    })
})