import assert from "assert";
import { Container } from "typescript-ioc";
import { extractClientById } from "../../../extractors";
import { mockClient1 } from "../../../mocks";
import { GameStateStore, TableStateStore } from "../../../store";
import { EClientConnectionStatuses, ETableClientEvents } from "../../../typings";
import { ConnectionHandler } from "../ConnectionHandler";

describe(`Handler for ${ETableClientEvents.DISCONNECT}`, () => {
  const connectionHandler = new ConnectionHandler();
  const gameStateStore = Container.get(GameStateStore);
  const tableStateStore = Container.get(TableStateStore);
  const client = mockClient1;
  const { clientId } = mockClient1.clientInfo;
  const socketId = "client-socket1";

  beforeEach(() => {
    gameStateStore.resetState();
    tableStateStore.resetState();
    gameStateStore.changeState((draft) => {
      draft.clients.set(client.clientInfo.clientId, client);
    });
    tableStateStore.changeState((draft) => {
      draft.socketIdMapping[socketId] = clientId;
    });
  });

  it(`should set clients connection status to ${EClientConnectionStatuses.DISCONNECTED}`, () => {
    connectionHandler.disconnect(socketId);

    const disconnectedClinet = extractClientById(gameStateStore.state, clientId);
    assert.equal(disconnectedClinet.status, EClientConnectionStatuses.DISCONNECTED);
  });
});
