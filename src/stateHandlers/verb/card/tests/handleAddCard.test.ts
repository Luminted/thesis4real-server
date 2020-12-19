import assert from "assert";
import {Container} from "typescript-ioc";
import { mockClient1 } from "../../../../mocks";
import { GameStateStore } from "../../../../stores";
import { ECardVerbTypes, IAddCardVerb, ICardEntity } from "../../../../typings";
import { CardVerbHandler } from "../CardVerbHandler";

describe(`Handler for ${ECardVerbTypes.ADD_CARD} verb`, () => {
    const cardVerbHandler = new CardVerbHandler();
    const gameStateStore = Container.get(GameStateStore);
    const {clientInfo: {clientId}} = mockClient1;
    const verb: IAddCardVerb = {
        type: ECardVerbTypes.ADD_CARD,
        positionX: 14,
        positionY: 77,
        rotation: 34,
        faceUp: true,
        metadata: {
            payload: "info"
        }
    }

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.clients.set(clientId, {...mockClient1});
        })
    })

    it("should add a card entity with parameters described in verb", () => {
        cardVerbHandler.addCard(verb);

        const { value } = gameStateStore.state.cards.values().next();
        const addedEntity = value as ICardEntity;
        assert.equal(addedEntity.positionX, verb.positionX);
        assert.equal(addedEntity.positionY, verb.positionY);
        assert.equal(addedEntity.rotation, verb.rotation);
        assert.equal(addedEntity.faceUp, verb.faceUp);
        assert.deepEqual(addedEntity.metadata, verb.metadata);
    })

    it("should add card entity on top z index", () => {
        cardVerbHandler.addCard(verb);

        const { value } = gameStateStore.state.cards.values().next();
        const addedEntity = value as ICardEntity;
        assert.equal(addedEntity.zIndex, gameStateStore.state.topZIndex);
    })
    it("should add card entity with ownerDeck as null", () => {
        cardVerbHandler.addCard(verb);

        const { value } = gameStateStore.state.cards.values().next();
        const addedEntity = value as ICardEntity;
        assert.equal(addedEntity.ownerDeck, null);
    })
    it("should add card entity with grabbedBy as null", () => {
        cardVerbHandler.addCard(verb);

        const { value } = gameStateStore.state.cards.values().next();
        const addedEntity = value as ICardEntity;
        assert.equal(addedEntity.grabbedBy, null);
    })

})