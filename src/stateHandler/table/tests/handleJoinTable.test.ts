import assert from "assert";
import { Container } from "typescript-ioc";
import { EErrorTypes } from "../../../errors";
import { extractClientById, extractClientHandById, extractClientIdBySocketId } from "../../../extractors";
import { GameStateStore, TableStateStore } from "../../../store";
import { EClientConnectionStatuses, ETableClientEvents } from "../../../typings";
import { TableHandler } from "../TableHandler";

describe(`Handler for ${ETableClientEvents.JOIN_TABLE}`, () => {
  const tableHandler = new TableHandler();
  const tableStateStore = Container.get(TableStateStore);
  const gameStateStore = Container.get(GameStateStore);
  const socketId = "socket-client-1";
  const requestedSeatId = "1";

  beforeEach(() => {
    tableStateStore.resetState();
    gameStateStore.resetState();
  });

  it("should create new client", () => {
    tableHandler.joinTable(requestedSeatId, socketId);

    const clientId = extractClientIdBySocketId(tableStateStore.state, socketId);
    const client = extractClientById(gameStateStore.state, clientId);
    assert.notEqual(client, undefined);
  });

  it("should create hand for client", () => {
    tableHandler.joinTable(requestedSeatId, socketId);

    const clientId = extractClientIdBySocketId(tableStateStore.state, socketId);
    const hand = extractClientHandById(gameStateStore.state, clientId);
    assert.notEqual(hand, undefined);
  });
  it("should assign requested seat ID for created client", () => {
    tableHandler.joinTable(requestedSeatId, socketId);

    const clientId = extractClientIdBySocketId(tableStateStore.state, socketId);
    const {
      clientInfo: { seatId },
    } = extractClientById(gameStateStore.state, clientId);
    assert.equal(seatId, requestedSeatId);
  });
  it("should create client with given name", () => {
    const givenName = "Johnny boi";

    tableHandler.joinTable(requestedSeatId, socketId, givenName);

    const clientId = extractClientIdBySocketId(tableStateStore.state, socketId);
    const {
      clientInfo: { name },
    } = extractClientById(gameStateStore.state, clientId);
    assert(name, givenName);
  });
  it("should throw ExtractorError if requested seat is not empty", () => {
    tableStateStore.changeState((draft) => {
      draft.emptySeats = draft.emptySeats.filter((seatId) => seatId !== requestedSeatId);
    });

    assert.throws(() => tableHandler.joinTable(requestedSeatId, socketId), {
      name: EErrorTypes.StateHandlerError,
    });
  });
  it("should remove assigned seat from empty seats", () => {
    tableHandler.joinTable(requestedSeatId, socketId);

    const { emptySeats } = tableStateStore.state;
    assert.equal(
      emptySeats.some((seatId) => seatId === requestedSeatId),
      false,
    );
  });
  it(`should create client with status ${EClientConnectionStatuses.CONNECTED}`, () => {
    tableHandler.joinTable(requestedSeatId, socketId);

    const clientId = extractClientIdBySocketId(tableStateStore.state, socketId);
    const createdClient = extractClientById(gameStateStore.state, clientId);
    assert.equal(createdClient.status, EClientConnectionStatuses.CONNECTED);
  });
  it("should throw StateHandlerError if cient is already present", () => {
    tableStateStore.changeState((draft) => {
      draft.socketIdMapping[socketId] = "client-1";
    });

    assert.throws(() => tableHandler.joinTable(requestedSeatId, socketId), {
      name: EErrorTypes.StateHandlerError,
    });
  });
  it("should map clients socket ID to client ID", () => {
    tableHandler.joinTable(requestedSeatId, socketId);

    const clientId = extractClientIdBySocketId(tableStateStore.state, socketId);
    assert.notEqual(clientId, undefined);
  });
});
