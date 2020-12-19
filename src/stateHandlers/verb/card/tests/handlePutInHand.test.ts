import assert from "assert";
import { Container } from "typescript-ioc";
import { extractCardById, extractCardFromClientHandById, extractClientHandById, extractGrabbedEntityOfClientById } from "../../../../extractors";
import { cardEntityMock1, handCardMock1, mockClient1, mockClient2 } from "../../../../mocks";
import { GameStateStore } from "../../../../stores";
import { ECardVerbTypes, IPutInHandVerb } from "../../../../typings";
import { TableHandler } from "../../../table";
import { CardVerbHandler } from "../CardVerbHandler";

describe(`Handler for ${ECardVerbTypes.PUT_IN_HAND} verb`, () => {
  const cardVerbHandler = new CardVerbHandler();
  const tableHandler = new TableHandler();
  const gameStateStore = Container.get(GameStateStore);
  const {
    clientInfo: { clientId: clientId1 },
  } = mockClient1;
  const {
    clientInfo: { clientId: clientId2 },
  } = mockClient2;
  const { entityId, entityType } = cardEntityMock1;
  const verb: IPutInHandVerb = {
    entityId,
    clientId: clientId1,
    toHandOf: clientId2,
    type: ECardVerbTypes.PUT_IN_HAND,
    faceUp: true,
  };

  beforeEach(() => {
    gameStateStore.resetState();
    gameStateStore.changeState((draft) => {
      draft.cards.set(entityId, { ...cardEntityMock1 });
      draft.clients.set(clientId1, {
        ...mockClient1,
        grabbedEntity: {
          entityId,
          entityType,
          grabbedAtX: 15,
          grabbedAtY: 20,
        },
      });
      draft.hands.set(clientId2, tableHandler.createClientHand(clientId2));
    });
  });

  it("should add the grabbed card to clients hand described in verb", () => {
    cardVerbHandler.putInHand(verb);
    const cardPutInHand = extractCardFromClientHandById(gameStateStore.state, verb.toHandOf, entityId);
    assert.notEqual(cardPutInHand, undefined);
  });

  it("should set issuing clients grabbed card to null", () => {
    cardVerbHandler.putInHand(verb);
    const grabbedEntity = extractGrabbedEntityOfClientById(gameStateStore.state, verb.clientId);
    assert.equal(grabbedEntity, null);
  });
  it("should remove card being put in hand from cards array", () => {
    cardVerbHandler.putInHand(verb);
    assert.throws(() => extractCardById(gameStateStore.state, entityId));
  });
  it("should create hand card with faceUp according to verb", () => {
    cardVerbHandler.putInHand(verb);
    const cardPutInHand = extractCardFromClientHandById(gameStateStore.state, clientId2, entityId);
    assert.equal(cardPutInHand.faceUp, verb.faceUp);
  });

  it("should update hand ordering", () => {
    gameStateStore.changeState((draft) => {
      const hand = extractClientHandById(draft, clientId2);
      hand.cards.push(handCardMock1, handCardMock1);
      hand.ordering = [1, 0];
    });

    cardVerbHandler.putInHand(verb);

    const { ordering } = extractClientHandById(gameStateStore.state, clientId2);
    const expectedOrdering = [1, 0, 2];
    assert.deepEqual(ordering, expectedOrdering);
  });
});
