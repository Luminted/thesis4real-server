import assert from "assert";
import {Container} from "typescript-ioc";
import { mockClient1 } from "../../../../mocks/clientMocks";
import { TableStateStore } from "../../../../stores/TableStateStore";
import { EntityTypes, CardEntity } from "../../../../types/dataModelDefinitions";
import { CardVerbTypes, IAddCardVerb,  } from "../../../../types/verb";
import { CardVerbHandler } from "../CardVerbHandler";

describe(`handling ${CardVerbTypes.ADD_CARD}`, () => {
    const cardVerbHandler = new CardVerbHandler();
    const {gameStateStore} = Container.get(TableStateStore).state;
    const {clientInfo: {clientId}} = mockClient1;

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.clients.set(clientId, {...mockClient1});
        })
    })

    it("should add a card entity with verb parameters", () => {
        const verb: IAddCardVerb = {
            type: CardVerbTypes.ADD_CARD,
            positionX: 14,
            positionY: 77,
            rotation: 34,
            faceUp: true,
            metadata: {
                payload: "info"
            }
        }

        const nextGameState = cardVerbHandler.addCard(verb);

        const { value } = nextGameState.cards.values().next();
        const addedEntity = value as CardEntity;
        assert.equal(addedEntity.positionX, verb.positionX);
        assert.equal(addedEntity.positionY, verb.positionY);
        assert.equal(addedEntity.rotation, verb.rotation);
        assert.equal(addedEntity.faceUp, verb.faceUp);
        assert.deepEqual(addedEntity.metadata, verb.metadata);
    })
})