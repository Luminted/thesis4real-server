import throttle from "lodash.throttle";
import { SocketNamespace } from "..";
import { Singleton, Inject } from "typescript-ioc";
import { Verb } from "../../types/verb";
import { TableClientEvents, TableServerEvents } from "../../types/socketTypes";
import { serializeGameState } from "../../utils";
import { GameState, ClientInfo, SerializedGameState } from "../../types/dataModelDefinitions";
import { extractClientById } from "../../extractors/gameStateExtractors";
import { TableHandler, VerbHandler } from "../../stateHandlers";
import { ConnectionHandler } from "../../stateHandlers/Connection/ConnectionHandler";
 
@Singleton
export class TableNamespace extends SocketNamespace {

    @Inject
    private verbHandler: VerbHandler;
    @Inject
    private tableHandler: TableHandler;
    @Inject
    private connectionHandler: ConnectionHandler;

    constructor(){
        super();

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
        // TODO: Make the frequency configurable
    }, 1000/60);
}