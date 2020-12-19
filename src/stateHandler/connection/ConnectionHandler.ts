import { Inject, Singleton } from "typescript-ioc";
import { extractClientIdBySocketId } from "../../extractors";
import { GameStateStore, TableStateStore } from "../../store";
import { EClientConnectionStatuses } from "../../typings";

@Singleton
export class ConnectionHandler {
  @Inject
  private gameStateStore: GameStateStore;
  @Inject
  private tableStateStore: TableStateStore;

  public disconnect(socketId: string) {
    const clientId = extractClientIdBySocketId(this.tableStateStore.state, socketId);
    this.gameStateStore.changeState((draft) => {
      const client = draft.clients.get(clientId);
      if (client) {
        client.status = EClientConnectionStatuses.DISCONNECTED;
      }
    });
  }
}
