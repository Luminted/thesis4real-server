import { Inject, Singleton } from "typescript-ioc";
import { extractClientById } from "../../extractors/gameStateExtractors";
import { GameStateStore } from "../../stores/GameStateStore";
import { TableStateStore } from "../../stores/TableStateStore/TableStateStore";
import { ClientConnectionStatuses } from "../../types/socketTypes";

@Singleton
export class ConnectionHandler {
    @Inject
    private tableStateStore: TableStateStore;
    private gameStateStore: GameStateStore;

    constructor(){
        this.gameStateStore = this.tableStateStore.state.gameStateStore;
    }

   disconnect(clientId: string){
       this.gameStateStore.changeState(draft => {
           const client = extractClientById(draft, clientId);
           if(client){
               client.status = ClientConnectionStatuses.DISCONNECTED;
           }
        })
        
        return this.gameStateStore.state;
    }
}