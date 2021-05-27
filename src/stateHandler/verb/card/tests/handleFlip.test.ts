import assert from "assert";
import { Container } from "typescript-ioc";
import { EErrorTypes } from "../../../../errors";
import { extractCardById } from "../../../../extractors";
import { cardEntityMock1, mockClient1 } from "../../../../mocks";
import { GameStateStore } from "../../../../store";
import { ECardVerbTypes, IFlipVerb } from "../../../../typings";
import { CardVerbHandler } from "../CardVerbHandler";

describe(`Handler for ${ECardVerbTypes.FLIP} verb`, () => {
  const cardVerbHandler = new CardVerbHandler();
  const gameStateStore = Container.get(GameStateStore);
  const {
    clientInfo: { clientId },
  } = mockClient1;
  const verbBase: Omit<IFlipVerb, "entityId"> = {
    type: ECardVerbTypes.FLIP,
  };

  beforeEach(() => {
    gameStateStore.resetState();
    gameStateStore.changeState((draft) => {
      draft.clients.set(clientId, { ...mockClient1 });
    });
  });

  it("should negate faceUp field of card", () => {
    const { entityId } = cardEntityMock1;
    const verb: IFlipVerb = {
      ...verbBase,
      entityId,
    };
    gameStateStore.changeState((draft) => {
      draft.cards.set(entityId, { ...cardEntityMock1 });
    });

    cardVerbHandler.flip(verb);

    const flippedCard = extractCardById(gameStateStore.state, entityId);
    assert.equal(flippedCard.faceUp, !cardEntityMock1.faceUp);
  });

  it("should throw ExtractorError if card does not exist", () => {
    const verb: IFlipVerb = {
      entityId: "nonExistentCardId",
      type: ECardVerbTypes.FLIP,
    };

    assert.throws(() => cardVerbHandler.flip(verb), {
      name: EErrorTypes.ExtractorError,
    });
  });
});
