import assert from "assert";
import {Container} from "typescript-ioc";
import { mockClient1 } from "../../../../mocks/clientMocks";
import { TableStateStore } from "../../../../stores/TableStateStore";
import { DeckVerbTypes, IAddDeckVerb, DeckEntity } from "../../../../typings";
import { DeckVerbHandler } from "../../Deck";

describe(`handle ${DeckVerbTypes.ADD_DECK}`, () => {
    const deckVerbHandler = new DeckVerbHandler();
    const {gameStateStore} = Container.get(TableStateStore).state;
    const {clientInfo: {clientId}} = mockClient1;

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.clients.set(clientId, {...mockClient1});
        })
    })

    it("should add a deck entity with verb parameters", () => {
        const verb: IAddDeckVerb = {
            type: DeckVerbTypes.ADD_DECK,
            positionX: 14,
            positionY: 77,
            rotation: 34,
            metadata: {
                data: "info"
            },
            containedCardsMetadata: [{data: "card_info"}]
        }

        const nextGameState = deckVerbHandler.addDeck(verb);

        const { value } = nextGameState.decks.values().next();
        const addedEntity = value as DeckEntity;
        assert.equal(addedEntity.positionX, verb.positionX);
        assert.equal(addedEntity.positionY, verb.positionY);
        assert.equal(addedEntity.rotation, verb.rotation);
        assert.deepEqual(addedEntity.metadata, verb.metadata);
        assert.deepEqual(addedEntity.cards.map(({metadata}) => ({...metadata}) ), verb.containedCardsMetadata);
    })
})