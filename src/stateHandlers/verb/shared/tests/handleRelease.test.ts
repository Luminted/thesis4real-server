import assert from "assert";
import { Container } from "typescript-ioc";
import { extractEntityByTypeAndId, extractGrabbedEntityOfClientById } from "../../../../extractors";
import { cardEntityMock1, mockClient1 } from "../../../../mocks";
import { GameStateStore } from "../../../../stores";
import { EEntityTypes, ESharedVerbTypes, IReleaseVerb } from "../../../../typings";
import { SharedVerbHandler } from "../SharedVerbHandler";

describe(`Handler for ${ESharedVerbTypes.RELEASE} verb`, () => {
  const sharedVerbHandler = new SharedVerbHandler();
  const gameStateStore = Container.get(GameStateStore);
  const {
    clientInfo: { clientId },
  } = mockClient1;
  const card = { ...cardEntityMock1, grabbedBy: clientId };
  const verb: IReleaseVerb = {
    clientId,
    type: ESharedVerbTypes.RELEASE,
    entityId: card.entityId,
    entityType: card.entityType,
  };
  card.grabbedBy = clientId;

  beforeEach(() => {
    gameStateStore.resetState();
    gameStateStore.changeState((draft) => {
      draft.cards.set(card.entityId, card);
      draft.clients.set(clientId, { ...mockClient1 });
    });
  });

  it("should set grabbedEntity to null for issuing client.", () => {
    sharedVerbHandler.release(verb);

    const grabbedEntity = extractGrabbedEntityOfClientById(gameStateStore.state, verb.clientId);
    assert.equal(grabbedEntity, null);
  });
  it("should set grabbedBy to null on released entity", () => {
    const { entityId, entityType } = verb;

    sharedVerbHandler.release(verb);

    const releasedEntity = extractEntityByTypeAndId(gameStateStore.state, entityType, entityId);
    assert.equal(releasedEntity.grabbedBy, null);
  });
});
