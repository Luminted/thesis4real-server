import assert from "assert";
import { Container } from "typescript-ioc";
import { extractCardById } from "../../../../extractors";
import { cardEntityMock1, mockClient1 } from "../../../../mocks";
import { GameStateStore } from "../../../../stores";
import { IRotateVerb, ESharedVerbTypes } from "../../../../typings";
import { SharedVerbHandler } from "../SharedVerbHandler";


describe(`handle ${ESharedVerbTypes.ROTATE}`, () => {
    const sharedVerbHandler = new SharedVerbHandler();
    const gameStateStore = Container.get(GameStateStore)
    const {entityId, entityType} = cardEntityMock1;
    const {clientInfo: {clientId}} = mockClient1;
    const verb: IRotateVerb = {
        type: ESharedVerbTypes.ROTATE,
        angle: 12,
        entityId: entityId,
        entityType: entityType,
    }

    beforeEach((() => {
        gameStateStore.resetState();
        gameStateStore.changeState(draft => {
            draft.clients.set(clientId, mockClient1);
            draft.cards.set(entityId, cardEntityMock1);
        });
    }));

    it('should should add angle from verb to entities rotation', () => {
        const nextGameState = sharedVerbHandler.rotate(verb);

        const card = extractCardById(nextGameState ,entityId);

        assert.equal(card.rotation, cardEntityMock1.rotation + verb.angle);
    })
})