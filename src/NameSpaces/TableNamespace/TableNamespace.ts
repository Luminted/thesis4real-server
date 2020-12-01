import throttle from "lodash.throttle";
import { SocketNamespace } from "..";
import { Singleton, Inject } from "typescript-ioc";
import { TableClientEvents, TableServerEvents, Verb, GameState, ClientInfo, SerializedGameState } from "../../typings";
import { serializeGameState } from "../../utils";
import { extractClientById } from "../../extractors/gameStateExtractors";
import { TableHandler, VerbHandler } from "../../stateHandlers";
import { ConnectionHandler } from "../../stateHandlers/Connection/ConnectionHandler";
import { GameStateStore } from "../../stores/GameStateStore";
import { serverTick } from "../../config";
 
@Singleton
export class TableNamespace extends SocketNamespace {

    @Inject
    private verbHandler: VerbHandler;
    @Inject
    private tableHandler: TableHandler;
    @Inject
    private connectionHandler: ConnectionHandler;
    @Inject
    private gameStateStore: GameStateStore

    constructor(){
        super();

        this.onConnect = (socket) =>{
            socket.emit(TableServerEvents.SYNC, serializeGameState(this.gameStateStore.state));
        }

        this.addEventListener(TableClientEvents.VERB, (verb: Verb, acknowledgeFunction?: Function) => {
            const nextGameState = this.verbHandler.handleVerb(verb);

            this.syncGameState(nextGameState);
            if(acknowledgeFunction){
                acknowledgeFunction(serializeGameState(nextGameState));
            }
        });

        this.addEventListenerWithSocket(TableClientEvents.JOIN_TABLE, (socket: SocketIO.Socket) => (acknowledgeFunction?: (clientInfo: ClientInfo, gameState: SerializedGameState) => void) => {
            const { id } = socket;
            console.log(id, ' joined table');

            const nextGameState = this.tableHandler.joinTable(id);

            const {clientInfo} = extractClientById(nextGameState, id);
            const serializedGameState = serializeGameState(nextGameState);

            if(typeof acknowledgeFunction === 'function'){
                acknowledgeFunction(clientInfo, serializedGameState);
            }

            this.syncGameState(nextGameState);
        })

        // TODO: type reason and handle cases
        this.addEventListenerWithSocket(TableClientEvents.DISCONNECT, (socket: SocketIO.Socket) => (reason: string) => {
            console.log('Disconnection reason: ', reason);
            
            const {id} = socket;

            const nextGameState = this.connectionHandler.disconnect(id);

            this.syncGameState(nextGameState);
        });
    }

    private syncGameState = throttle((gameState: GameState) => {
        this.emit(TableServerEvents.SYNC, serializeGameState(gameState));
    }, serverTick);
}