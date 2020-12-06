import assert from "assert";
import { Container } from "typescript-ioc";
import { extractCardById } from "../../../../extractors/gameStateExtractors";
import { mockClient1 } from "../../../../mocks/clientMocks";
import { cardEntityMock1 } from "../../../../mocks/entityMocks";
import { GameStateStore } from "../../../../stores/GameStateStore";
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

        const nextGameState = cardVerbHandler.flip(verb);

        const flippedCard = extractCardById(nextGameState, entityId);
        assert.equal(flippedCard.faceUp, !cardEntityMock1.faceUp);
    })
})