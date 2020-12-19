import assert from "assert";
import cloneDeep from "lodash.clonedeep";
import { Container } from "typescript-ioc";
import { extractCardById, extractClientById } from "../../../../extractors";
import { cardEntityMock1, cardEntityMock2, deckEntityMock1, deckEntityMock2, mockClient1 } from "../../../../mocks";
import { GameStateStore } from "../../../../stores";
import { EEntityTypes, ESharedVerbTypes, ICardEntity, IMoveVerb } from "../../../../typings";
import { SharedVerbHandler } from "../SharedVerbHandler";

describe(`Handler for ${ESharedVerbTypes.MOVE} verb`, () => {
  const sharedVerbHandler = new SharedVerbHandler();
  const gameStateStore = Container.get(GameStateStore);
  const {
    clientInfo: { clientId },
  } = mockClient1;
  const testedVerbType = ESharedVerbTypes.MOVE;

  beforeEach("Setting up test data...", () => {
    gameStateStore.resetState();
    gameStateStore.changeState((draft) => {
      draft.cards.set(cardEntityMock1.entityId, { ...cardEntityMock1 });
      draft.clients.set(clientId, { ...mockClient1 });
    });
  });

  it("should move the entity and update grabbedEntity position for client issuing verb", () => {
    const grabbedAt = {
      x: 2,
      y: 3,
    };
    let verb: IMoveVerb;
    const entityType = EEntityTypes.CARD;
    let movedCard: ICardEntity;
    const { entityId } = cardEntityMock1;

    gameStateStore.changeState((draft) => {
      extractClientById(draft, clientId).grabbedEntity = {
        entityId,
        entityType,
        grabbedAtX: grabbedAt.x,
        grabbedAtY: grabbedAt.y,
      };
    });

    // LEFT
    verb = {
      clientId,
      type: testedVerbType,
      positionX: 1,
      positionY: 3,
    };

    sharedVerbHandler.move(verb);

    movedCard = extractCardById(gameStateStore.state, entityId);
    assert.equal(movedCard.positionX, cardEntityMock1.positionX + verb.positionX - grabbedAt.x);
    assert.equal(movedCard.positionY, cardEntityMock1.positionY + verb.positionY - grabbedAt.y);

    // RIGHT
    verb = {
      clientId,
      type: testedVerbType,
      positionX: 3,
      positionY: 3,
    };

    sharedVerbHandler.move(verb);

    movedCard = extractCardById(gameStateStore.state, cardEntityMock1.entityId);
    assert.equal(movedCard.positionX, cardEntityMock1.positionX + verb.positionX - grabbedAt.x);
    assert.equal(movedCard.positionY, cardEntityMock1.positionY + verb.positionY - grabbedAt.y);

    // UP
    verb = {
      clientId,
      type: testedVerbType,
      positionX: 2,
      positionY: 1,
    };

    sharedVerbHandler.move(verb);

    movedCard = extractCardById(gameStateStore.state, cardEntityMock1.entityId);
    assert.equal(movedCard.positionX, cardEntityMock1.positionX + verb.positionX - grabbedAt.x);
    assert.equal(movedCard.positionY, cardEntityMock1.positionY + verb.positionY - grabbedAt.y);

    // DOWN
    verb = {
      clientId,
      type: testedVerbType,
      positionX: 2,
      positionY: 3,
    };

    sharedVerbHandler.move(verb);

    movedCard = extractCardById(gameStateStore.state, cardEntityMock1.entityId);
    assert.equal(movedCard.positionX, cardEntityMock1.positionX + verb.positionX - grabbedAt.x);
    assert.equal(movedCard.positionY, cardEntityMock1.positionY + verb.positionY - grabbedAt.y);
  });
  it("should ignore input if the entityId in the input is null", () => {
    const originalState = cloneDeep(gameStateStore.state);
    const verb: IMoveVerb = {
      clientId,
      type: testedVerbType,
      positionX: 1,
      positionY: 2,
    };

    sharedVerbHandler.move(verb);

    assert.deepEqual(gameStateStore.state.cards, originalState.cards);
  });
});
