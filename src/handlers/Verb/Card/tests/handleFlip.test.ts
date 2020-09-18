import assert from "assert";
import { Container } from "typescript-ioc";
import { extractCardById, extractCardFromClientHandById } from "../../../../extractors/gameStateExtractors";
import { clientHandFactory } from "../../../../factories";
import { client1 } from "../../../../mocks/client";
import { cardEntityMock, cardRepresentationMock } from "../../../../mocks/entity";
import { TableStateStore } from "../../../../stores/TableStateStore/TableStateStore";
import { EntityTypes } from "../../../../types/dataModelDefinitions";
import { CardVerb, CardVerbTypes } from "../../../../types/verbTypes";
import { CardVerbHandler } from "../CardVerbHandler";

describe(`handling ${CardVerbTypes.FLIP}`, () => {
    const cardVerbHandler = new CardVerbHandler();
    const {gameStateStore} = Container.get(TableStateStore).state;
    const {clientInfo: {clientId}} = client1;
    const verbBase: Omit<CardVerb, "entityId"> = {
        clientId,
        type: CardVerbTypes.FLIP,
        entityType: EntityTypes.CARD,
        positionX: 0,
        positionY: 0,
    }

    beforeEach(() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {draft.clients.set(clientId, client1)});
    })

    it("should negate faceUp field of card", () => {
        const {entityId} = cardEntityMock;
        const verb: CardVerb = {
            ...verbBase,
            entityId
        }
        gameStateStore.changeState(draft => {draft.cards.set(entityId, cardEntityMock)});

        const nextGameState = cardVerbHandler.flip(verb);

        const flippedCard = extractCardById(nextGameState, entityId);
        assert.equal(flippedCard.faceUp, !cardEntityMock.faceUp);
    })

    it("should work with cards held in hand too", () => {
        const {entityId} = cardRepresentationMock;
        const verb: CardVerb = {
            ...verbBase,
            entityId
        }
        const hand = clientHandFactory(clientId);
        hand.cards.push(cardRepresentationMock);
        gameStateStore.changeState(draft => { draft.hands.set(clientId, hand) });

        const nextGameState = cardVerbHandler.flip(verb);

        const flippedCard = extractCardFromClientHandById(nextGameState, clientId, entityId);
        assert.equal(flippedCard.faceUp, !cardRepresentationMock.faceUp);
    })
})