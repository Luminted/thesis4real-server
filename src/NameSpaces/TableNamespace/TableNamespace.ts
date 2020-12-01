import throttle from "lodash.throttle";
import { SocketNamespace } from "..";
import { Singleton, Inject } from "typescript-ioc";
import { ETableClientEvents, ETableServerEvents, TVerb, TGameState, TClientInfo, TSerializedGameState } from "../../typings";
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
            socket.emit(ETableServerEvents.SYNC, serializeGameState(this.gameStateStore.state));
        }

        this.addEventListener(ETableClientEvents.VERB, (verb: TVerb, acknowledgeFunction?: Function) => {
            const nextGameState = this.verbHandler.handleVerb(verb);

            this.syncGameState(nextGameState);
            if(acknowledgeFunction){
                acknowledgeFunction(serializeGameState(nextGameState));
            }
        });

        this.addEventListenerWithSocket(ETableClientEvents.JOIN_TABLE, (socket: SocketIO.Socket) => (acknowledgeFunction?: (clientInfo: TClientInfo, gameState: TSerializedGameState) => void) => {
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
        this.addEventListenerWithSocket(ETableClientEvents.DISCONNECT, (socket: SocketIO.Socket) => (reason: string) => {
            console.log('Disconnection reason: ', reason);
            
            const {id} = socket;

            const nextGameState = this.connectionHandler.disconnect(id);

            this.syncGameState(nextGameState);
        });
    }

    private syncGameState = throttle((gameState: TGameState) => {
        this.emit(ETableServerEvents.SYNC, serializeGameState(gameState));
    }, serverTick);
}