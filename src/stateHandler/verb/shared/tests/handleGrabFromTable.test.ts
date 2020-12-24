import assert from "assert";
import cloneDeep from "lodash.clonedeep";
import { Container } from "typescript-ioc";
import { extractCardById, extractEntityByTypeAndId, extractGrabbedEntityOfClientById } from "../../../../extractors";
import { cardEntityMock1, cardEntityMock2, mockClient1, mockClient2 } from "../../../../mocks";
import { GameStateStore } from "../../../../store";
import { ESharedVerbTypes, IGrabVerb } from "../../../../typings";
import { SharedVerbHandler } from "../SharedVerbHandler";

describe(`Hander for ${ESharedVerbTypes.GRAB} verb`, () => {
  const sharedVerbHandler = new SharedVerbHandler();
  const gameStateStore = Container.get(GameStateStore);
  const {
    clientInfo: { clientId },
  } = mockClient1;
  const cardOnTable = { ...cardEntityMock1 };
  const verb: IGrabVerb = {
    clientId,
    type: ESharedVerbTypes.GRAB,
    positionX: 0,
    positionY: 1,
    entityId: cardOnTable.entityId,
    entityType: cardOnTable.entityType,
  };

  beforeEach(() => {
    gameStateStore.resetState();
    gameStateStore.changeState((draft) => {
      draft.cards.set(cardOnTable.entityId, cardOnTable);
      draft.clients.set(clientId, { ...mockClient1 });
    });
  });

  it("should set grabbed cards info as grabbing clients grabbedEntity", () => {
    const { entityId } = cardOnTable;
    const { positionX, positionY } = verb;

    sharedVerbHandler.grabFromTable(verb);

    const grabbedEntity = extractGrabbedEntityOfClientById(gameStateStore.state, verb.clientId);
    assert.equal(grabbedEntity.entityId, entityId);
    assert.equal(grabbedEntity.grabbedAtX, positionX);
    assert.equal(grabbedEntity.grabbedAtY, positionY);
  });

  it("should set grabbedBy of grabbed card to grabbing clients ID", () => {
    const { entityId, entityType } = cardOnTable;

    sharedVerbHandler.grabFromTable(verb);

    const nextCard = extractEntityByTypeAndId(gameStateStore.state, entityType, entityId);
    assert.equal(nextCard.grabbedBy, clientId);
  });
  it("should do nothing if card is already grabbed", () => {
    const { entityId, entityType } = cardEntityMock2;
    const positionX = 1;
    const positionY = 2;
    const grabVerb: IGrabVerb = {
      clientId,
      positionX,
      positionY,
      entityId,
      entityType,
      type: ESharedVerbTypes.GRAB,
    };

    gameStateStore.changeState((draft) => {
      draft.cards.set(entityId, { ...cardEntityMock2, grabbedBy: mockClient2.clientInfo.clientId });
    });
    const originalState = cloneDeep(gameStateStore.state);

    sharedVerbHandler.grabFromTable(grabVerb);

    assert.deepEqual(gameStateStore.state, originalState);
  });
  it("should increase top Z index by one and assign it to grabbed card", () => {
    const originalTopZIndex = gameStateStore.state.topZIndex;

    sharedVerbHandler.grabFromTable(verb);

    const grabbedCard = extractCardById(gameStateStore.state, cardOnTable.entityId);
    const bumpedZindex = gameStateStore.state.topZIndex;
    assert.equal(grabbedCard.zIndex, originalTopZIndex + 1);
    assert.equal(bumpedZindex, originalTopZIndex + 1);
  });
});
