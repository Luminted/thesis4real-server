import assert from "assert";
import { Container } from "typescript-ioc";
import { extractCardById } from "../../../../extractors";
import { cardEntityMock1, mockClient1 } from "../../../../mocks";
import { GameStateStore } from "../../../../stores";
import { ESharedVerbTypes, IRotateVerb } from "../../../../typings";
import { SharedVerbHandler } from "../SharedVerbHandler";

describe(`Handler for ${ESharedVerbTypes.ROTATE} verb`, () => {
  const sharedVerbHandler = new SharedVerbHandler();
  const gameStateStore = Container.get(GameStateStore);
  const { entityId, entityType } = cardEntityMock1;
  const {
    clientInfo: { clientId },
  } = mockClient1;
  const verb: IRotateVerb = {
    entityId,
    entityType,
    type: ESharedVerbTypes.ROTATE,
    angle: 12,
  };

  beforeEach(() => {
    gameStateStore.resetState();
    gameStateStore.changeState((draft) => {
      draft.clients.set(clientId, mockClient1);
      draft.cards.set(entityId, cardEntityMock1);
    });
  });

  it("should should add angle from verb to entities rotation", () => {
    sharedVerbHandler.rotate(verb);

    const card = extractCardById(gameStateStore.state, entityId);

    assert.equal(card.rotation, cardEntityMock1.rotation + verb.angle);
  });
});
