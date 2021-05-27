import assert from "assert";
import { Container } from "typescript-ioc";
import { EErrorTypes } from "../../../../errors";
import { extractCardById, extractDeckById } from "../../../../extractors";
import { cardEntityMock1, deckEntityMock1, mockClient1 } from "../../../../mocks";
import { GameStateStore } from "../../../../store";
import { EEntityTypes, ESharedVerbTypes, IMoveToVerb } from "../../../../typings";
import { SharedVerbHandler } from "../SharedVerbHandler";

describe(`Handler for ${ESharedVerbTypes.MOVE_TO} verb`, () => {
  const sharedVerbHandler = new SharedVerbHandler();
  const gameStateStore = Container.get(GameStateStore);
  const {
    clientInfo: { clientId },
  } = mockClient1;
  const { entityId: cardEntityId } = cardEntityMock1;
  const { entityId: deckEntityId } = deckEntityMock1;

  beforeEach(() => {
    gameStateStore.resetState();
    gameStateStore.changeState((draft) => {
      draft.cards.set(cardEntityId, { ...cardEntityMock1 });
      draft.decks.set(deckEntityId, { ...deckEntityMock1 });
      draft.clients.set(clientId, { ...mockClient1 });
    });
  });

  it("should move the card to given position", () => {
    const verb: IMoveToVerb = {
      type: ESharedVerbTypes.MOVE_TO,
      entityId: cardEntityId,
      entityType: EEntityTypes.CARD,
      positionX: 666,
      positionY: 777,
    };

    sharedVerbHandler.moveTo(verb);

    const movedCard = extractCardById(gameStateStore.state, cardEntityId);
    assert.equal(movedCard.positionX, verb.positionX);
    assert.equal(movedCard.positionY, verb.positionY);
  });

  it("should move the deck to given position", () => {
    const verb: IMoveToVerb = {
      type: ESharedVerbTypes.MOVE_TO,
      entityId: deckEntityId,
      entityType: EEntityTypes.DECK,
      positionX: 888,
      positionY: 999,
    };

    sharedVerbHandler.moveTo(verb);

    const movedDeck = extractDeckById(gameStateStore.state, deckEntityId);
    assert.equal(movedDeck.positionX, verb.positionX);
    assert.equal(movedDeck.positionY, verb.positionY);
  });

  it("should throw ExtractorError if entity does not exist", () => {
    const verb: IMoveToVerb = {
      type: ESharedVerbTypes.MOVE_TO,
      entityId: "nonExistingEntityId",
      entityType: EEntityTypes.DECK,
      positionX: 888,
      positionY: 999,
    };

    assert.throws(() => sharedVerbHandler.moveTo(verb), {
      name: EErrorTypes.ExtractorError,
    });
  });
});
