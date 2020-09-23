import assert from "assert";
import { Container } from "typescript-ioc";
import { extractCardById } from "../../../../extractors/gameStateExtractors";
import { mockClient1 } from "../../../../mocks/clientMocks";
import { cardEntityMock1 } from "../../../../mocks/entityMocks";
import { TableStateStore } from "../../../../stores/TableStateStore/TableStateStore";
import { RotateVerb, SharedVerbTypes } from "../../../../types/verbTypes";
import { SharedVerbHandler } from "../SharedVerbHandler";


describe(`handle ${SharedVerbTypes.ROTATE}`, () => {
    const sharedVerbHandler = new SharedVerbHandler();
    const gameStateStore = Container.get(TableStateStore).state.gameStateStore;
    const {entityId, entityType} = cardEntityMock1;
    const {clientInfo: {clientId}} = mockClient1;
    const verb: RotateVerb = {
        type: SharedVerbTypes.ROTATE,
        angle: 12,
        clientId: clientId,
        entityId: entityId,
        entityType: entityType,
        positionX: 0,
        positionY: 0,
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