import assert from "assert";
import { Container } from "typescript-ioc";
import { extractCardById, extractCardFromClientHandById } from "../../../../extractors/gameStateExtractors";
import { createClientHand } from "../../../../factories";
import { mockClient1 } from "../../../../mocks/clientMocks";
import { cardEntityMock1, handCardMock1 } from "../../../../mocks/entityMocks";
import { TableStateStore } from "../../../../stores/TableStateStore/TableStateStore";
import { EntityTypes } from "../../../../types/dataModelDefinitions";
import { CardVerbTypes, IFlipVerb } from "../../../../types/verb";
import { CardVerbHandler } from "../CardVerbHandler";

describe(`handling ${CardVerbTypes.FLIP}`, () => {
    const cardVerbHandler = new CardVerbHandler();
    const {gameStateStore} = Container.get(TableStateStore).state;
    const {clientInfo: {clientId}} = mockClient1;
    const verbBase: Omit<IFlipVerb, "entityId"> = {
        type: CardVerbTypes.FLIP,
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

    it("should work with cards held in hand too", () => {
        const {entityId} = handCardMock1;
        const verb: IFlipVerb = {
            ...verbBase,
            entityId
        }
        const hand = createClientHand(clientId);
        hand.cards.push({...handCardMock1});
        gameStateStore.changeState(draft => { draft.hands.set(clientId, hand) });

        const nextGameState = cardVerbHandler.flip(verb);

        const flippedCard = extractCardFromClientHandById(nextGameState, clientId, entityId);
        assert.equal(flippedCard.faceUp, !handCardMock1.faceUp);
    })
})