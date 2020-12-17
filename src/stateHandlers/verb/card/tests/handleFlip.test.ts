import assert from "assert";
import { Container } from "typescript-ioc";
import { extractCardById } from "../../../../extractors";
import { mockClient1, cardEntityMock1 } from "../../../../mocks";
import { GameStateStore } from "../../../../stores";
import { ECardVerbTypes, IFlipVerb } from "../../../../typings";
import { CardVerbHandler } from "../CardVerbHandler";

describe(`handling ${ECardVerbTypes.FLIP}`, () => {
    const cardVerbHandler = new CardVerbHandler();
    const gameStateStore = Container.get(GameStateStore);
    const {clientInfo: {clientId}} = mockClient1;
    const verbBase: Omit<IFlipVerb, "entityId"> = {
        type: ECardVerbTypes.FLIP,
    }

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {draft.clients.set(clientId, {...mockClient1})});
    })

    it("should negate faceUp field of card", () => {
        const {entityId} = cardEntityMock1;
        const verb: IFlipVerb = {
            ...verbBase,
            entityId
        }
        gameStateStore.changeState(draft => {draft.cards.set(entityId, {...cardEntityMock1})});

        cardVerbHandler.flip(verb);

        const flippedCard = extractCardById(gameStateStore.state, entityId);
        assert.equal(flippedCard.faceUp, !cardEntityMock1.faceUp);
    })
})