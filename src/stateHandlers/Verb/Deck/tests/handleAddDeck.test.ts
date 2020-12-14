import assert from "assert";
import {Container} from "typescript-ioc";
import { mockClient1 } from "../../../../mocks/clientMocks";
import { GameStateStore } from "../../../../stores/GameStateStore";
import { EDeckVerbTypes, IAddDeckVerb, IDeckEntity } from "../../../../typings";
import { DeckVerbHandler } from "..";

describe(`handle ${EDeckVerbTypes.ADD_DECK}`, () => {
    const deckVerbHandler = new DeckVerbHandler();
    const gameStateStore = Container.get(GameStateStore);
    const {clientInfo: {clientId}} = mockClient1;

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.clients.set(clientId, {...mockClient1});
        })
    })

    it("should add a deck entity with verb parameters", () => {
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

        const newDeckEntityId = deckVerbHandler.addDeck(verb);

        const addedDeck = gameStateStore.state.decks.get(newDeckEntityId);
        assert.equal(addedDeck.positionX, verb.positionX);
        assert.equal(addedDeck.positionY, verb.positionY);
        assert.equal(addedDeck.rotation, verb.rotation);
        assert.deepEqual(addedDeck.metadata, verb.metadata);
        assert.deepEqual(addedDeck.cards.map(({metadata}) => ({...metadata}) ), verb.containedCardsMetadata);
    })
    it("should initialize numberOfCards to number of cards contained", () => {
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

        const newDeckEntityId = deckVerbHandler.addDeck(verb);

        const {numberOfCards, cards} = gameStateStore.state.decks.get(newDeckEntityId);
        assert.equal(numberOfCards, cards.length);
    })
})