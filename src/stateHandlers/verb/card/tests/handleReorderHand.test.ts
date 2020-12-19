import assert from "assert";
import { Container } from "typescript-ioc";
import { extractClientHandById } from "../../../../extractors";
import { handCardMock1, mockClient1 } from "../../../../mocks";
import { GameStateStore } from "../../../../stores";
import { ECardVerbTypes, IReorderHandVerb } from "../../../../typings";
import { TableHandler } from "../../../table";
import { CardVerbHandler } from "../CardVerbHandler";

describe(`Handler for ${ECardVerbTypes.REORDER_HAND} verb`, () => {
  const cardVerbHandler = new CardVerbHandler();
  const tableHandler = new TableHandler();
  const gameStateStore = Container.get(GameStateStore);
  const {
    clientInfo: { clientId },
  } = mockClient1;
  const verb: IReorderHandVerb = {
    clientId,
    type: ECardVerbTypes.REORDER_HAND,
    order: [0, 3, 2, 1],
  };

  beforeEach(() => {
    gameStateStore.resetState();
    gameStateStore.changeState((draft) => {
      draft.clients.set(clientId, { ...mockClient1 });
      draft.hands.set(clientId, tableHandler.createClientHand(clientId));

      draft.hands.get(clientId).cards.push({ ...handCardMock1 });
      draft.hands.get(clientId).cards.push({ ...handCardMock1 });
      draft.hands.get(clientId).cards.push({ ...handCardMock1 });
      draft.hands.get(clientId).cards.push({ ...handCardMock1 });
    });
  });

  it("should set the ordering of clients hand to the one in verb", () => {
    cardVerbHandler.reorderHand(verb);

    const { ordering } = extractClientHandById(gameStateStore.state, clientId);
    assert.deepEqual(ordering, verb.order);
  });
});
