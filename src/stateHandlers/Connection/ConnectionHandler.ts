import { Inject, Singleton } from "typescript-ioc";
import { extractClientById } from "../../extractors/gameStateExtractors";
import { extractClientIdBySocketId } from "../../extractors/tableStateExtractor";
import { GameStateStore } from "../../stores/GameStateStore";
import { TableStateStore } from "../../stores/TableStateStore";
import { EClientConnectionStatuses } from "../../typings";

@Singleton
export class ConnectionHandler {
    @Inject
    private gameStateStore: GameStateStore;
    @Inject
    private tableStateStore: TableStateStore;

    disconnect(socketId: string){
        const clientId = extractClientIdBySocketId(this.tableStateStore.state, socketId);
        this.gameStateStore.changeState(draft => {
            const client = draft.clients.get(clientId);
            if(client){
                client.status = EClientConnectionStatuses.DISCONNECTED;
            }
        })
        
        return this.gameStateStore.state;
    }
}