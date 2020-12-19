import assert from "assert";
import { Container } from "typescript-ioc";
import { extractClientById } from "../../../../extractors";
import { cardEntityMock1, deckEntityMock1, mockClient1, mockClient2 } from "../../../../mocks";
import { GameStateStore } from "../../../../stores";
import { EEntityTypes, ESharedVerbTypes, IRemoveVerb, TClient, TGrabbedEntity } from "../../../../typings";
import { SharedVerbHandler } from "../SharedVerbHandler";

describe(`Handler for ${ESharedVerbTypes.REMOVE} verb`, () => {
  const sharedVerbHandler = new SharedVerbHandler();
  const gameStateStore = Container.get(GameStateStore);
  const {
    clientInfo: { clientId },
  } = mockClient1;
  const { entityId: deckEntityId } = deckEntityMock1;

  beforeEach(() => {
    gameStateStore.resetState();
    gameStateStore.changeState((draft) => {
      draft.decks.set(deckEntityId, { ...deckEntityMock1 });
      draft.clients.set(clientId, { ...mockClient1 });
    });
  });

  it("should remove entity described in verb from game state", () => {
    const verb: IRemoveVerb = {
      type: ESharedVerbTypes.REMOVE,
      entityId: deckEntityId,
      entityType: EEntityTypes.DECK,
    };

    sharedVerbHandler.remove(verb);

    assert.equal(gameStateStore.state.decks.has(deckEntityId), false);
  });

  it("should set grabbEntity for client that is grabbing entity being removed", () => {
    const verb: IRemoveVerb = {
      type: ESharedVerbTypes.REMOVE,
      entityId: deckEntityId,
      entityType: EEntityTypes.CARD,
    };

    gameStateStore.changeState((draft) => {
      const grabbedEntity: TGrabbedEntity = {
        entityId: deckEntityId,
        entityType: EEntityTypes.CARD,
        grabbedAtX: 0,
        grabbedAtY: 0,
      };
      const client2: TClient = { ...mockClient2, grabbedEntity };
      extractClientById(draft, clientId).grabbedEntity = grabbedEntity;
      draft.clients.set(client2.clientInfo.clientId, client2);
    });

    sharedVerbHandler.remove(verb);

    gameStateStore.state.clients.forEach((client) => {
      const { grabbedEntity } = client;
      assert.equal(grabbedEntity, null);
    });
  });
});
