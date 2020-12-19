import assert from "assert";
import { Container } from "typescript-ioc";
import { extractCardById, extractClientIdBySocketId } from "../../../extractors";
import { cardEntityMock1, handCardMock1, handCardMock2, mockClient1 } from "../../../mocks";
import { GameStateStore, TableStateStore } from "../../../stores";
import { ETableClientEvents } from "../../../typings";
import { TableHandler } from "../TableHandler";

describe(`Handler for ${ETableClientEvents.LEAVE_TABLE}`, () => {
  const tableHandler = new TableHandler();
  const tableStateStore = Container.get(TableStateStore);
  const gameStateStore = Container.get(GameStateStore);
  const {
    clientInfo: { clientId },
  } = mockClient1;
  const socketId = "client-socket1";
  const cardInClientsHand1 = { ...handCardMock1 };
  const cardInClientsHand2 = { ...handCardMock2 };
  const defaultPosition: [number, number] = [15, 25];

  beforeEach(() => {
    gameStateStore.resetState();
    tableStateStore.resetState();
    gameStateStore.changeState((draft) => {
      const clientHand = tableHandler.createClientHand(clientId);
      clientHand.cards.push(cardInClientsHand1, cardInClientsHand2);
      draft.clients.set(clientId, { ...mockClient1 });
      draft.hands.set(clientId, clientHand);
    });
    tableStateStore.changeState((draft) => {
      draft.defaultPosition = defaultPosition;
      draft.socketIdMapping[socketId] = clientId;
    });
  });

  it("should remove client from clients", () => {
    tableHandler.leaveTable(clientId);

    const removedClient = gameStateStore.state.clients.get(clientId);
    assert.equal(removedClient, undefined);
  });
  it("should remove clients hand", () => {
    tableHandler.leaveTable(clientId);

    const removedHand = gameStateStore.state.hands.get(clientId);
    assert.equal(removedHand, undefined);
  });
  it("should put cards in clients hand on table at default point", () => {
    tableHandler.leaveTable(clientId);

    const gameState = gameStateStore.state;
    const cardPutBackOnTable1 = extractCardById(gameState, cardInClientsHand1.entityId);
    const cardPutBackOnTable2 = extractCardById(gameState, cardInClientsHand2.entityId);
    assert.equal(cardPutBackOnTable1.positionX, defaultPosition[0]);
    assert.equal(cardPutBackOnTable1.positionY, defaultPosition[1]);
    assert.equal(cardPutBackOnTable2.positionX, defaultPosition[0]);
    assert.equal(cardPutBackOnTable2.positionY, defaultPosition[1]);
  });

  it("should put cards from hand on top of cards on table", () => {
    const entityOnTable = { ...cardEntityMock1 };
    gameStateStore.changeState((draft) => {
      entityOnTable.zIndex = draft.topZIndex;
      draft.cards.set(entityOnTable.entityId, entityOnTable);
    });
    tableHandler.leaveTable(clientId);

    const gameState = gameStateStore.state;
    const nextEntityOnTable = extractCardById(gameState, entityOnTable.entityId);
    const cardPutBackOnTable1 = extractCardById(gameState, cardInClientsHand1.entityId);
    const cardPutBackOnTable2 = extractCardById(gameState, cardInClientsHand2.entityId);
    assert.equal(cardPutBackOnTable1.zIndex > nextEntityOnTable.zIndex, true);
    assert.equal(cardPutBackOnTable2.zIndex > nextEntityOnTable.zIndex, true);
  });

  it("should put clients seat back to empty seats", () => {
    const clientsSeat = mockClient1.clientInfo.seatId;
    tableStateStore.changeState((draft) => {
      draft.emptySeats = [];
    });

    tableHandler.leaveTable(clientId);

    assert.equal(tableStateStore.state.emptySeats.includes(clientsSeat), true);
  });

  it("should remove socket ID mapping", () => {
    tableHandler.leaveTable(clientId);

    assert.throws(() => extractClientIdBySocketId(tableStateStore.state, socketId));
  });
});
