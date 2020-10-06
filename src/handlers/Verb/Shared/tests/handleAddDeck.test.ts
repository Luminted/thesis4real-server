import assert from "assert";
import {Container} from "typescript-ioc";
import { mockClient1 } from "../../../../mocks/clientMocks";
import { TableStateStore } from "../../../../stores/TableStateStore";
import { DeckEntity, EntityTypes } from "../../../../types/dataModelDefinitions";
import { AddDeckVerb, DeckVerbTypes } from "../../../../types/verbTypes";
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
        const verb: AddDeckVerb = {
            clientId,
            type: DeckVerbTypes.ADD_DECK,
            entityType: EntityTypes.DECK,
            positionX: 14,
            positionY: 77,
            width: 17,
            height: 99,
            isBound: false,
            rotation: 34,
            metadata: {
                data: "info"
            }
        }

        const nextGameState = deckVerbHandler.addDeck(verb);

        const { value } = nextGameState.decks.values().next();
        const addedEntity = value as DeckEntity;
        assert.equal(addedEntity.positionX, verb.positionX);
        assert.equal(addedEntity.positionY, verb.positionY);
        assert.equal(addedEntity.width, verb.width);
        assert.equal(addedEntity.height, verb.height);
        assert.equal(addedEntity.entityType, verb.entityType);
        assert.equal(addedEntity.isBound, verb.isBound);
        assert.equal(addedEntity.rotation, verb.rotation);
        assert.deepEqual(addedEntity.metadata, verb.metadata);
    })
})