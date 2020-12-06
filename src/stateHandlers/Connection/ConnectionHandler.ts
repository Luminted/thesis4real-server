import { Inject, Singleton } from "typescript-ioc";
import { extractClientById } from "../../extractors/gameStateExtractors";
import { GameStateStore } from "../../stores/GameStateStore";
import { EClientConnectionStatuses } from "../../typings";

@Singleton
export class ConnectionHandler {
    @Inject
    private gameStateStore: GameStateStore;

    connect(clientId?: string) {
        if(clientId){
            this.gameStateStore.changeState(draft => {
                const client = extractClientById(draft, clientId);
                if(client.status === EClientConnectionStatuses.DISCONNECTED){
                    client.status = EClientConnectionStatuses.CONNECTED;
                }
                else{
                    throw new Error("Client with given ID already connected");
                }
            })
        }

        return this.gameStateStore.state;
    }

    disconnect(clientId: string){
        this.gameStateStore.changeState(draft => {
            const client = draft.clients.get(clientId);
            if(client){
                client.status = EClientConnectionStatuses.DISCONNECTED;
            }
        })
        
        return this.gameStateStore.state;
    }
}