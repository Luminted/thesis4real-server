import throttle from "lodash.throttle";
import { SocketNamespace } from "..";
import { Singleton, Inject } from "typescript-ioc";
import { ETableClientEvents, ETableServerEvents, TVerb, TGameState, TClientInfo, TSerializedGameState, TCustomError } from "../../typings";
import { extractClientById } from "../../extractors/gameStateExtractors";
import { TableHandler, VerbHandler } from "../../stateHandlers";
import { ConnectionHandler } from "../../stateHandlers/Connection/ConnectionHandler";
import { GameStateStore } from "../../stores/GameStateStore";
import { serverTick } from "../../config";
import {getVerbError} from "../../utils";
import { VerbError } from "../../error/VerbError";
 
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
            socket.emit(ETableServerEvents.SYNC, this.serializeGameState(this.gameStateStore.state));
        }

        this.addEventListener(ETableClientEvents.VERB, (verb: TVerb, acknowledgeFunction?: Function) => {
            let nextGameState: TGameState;
            try{
                nextGameState = this.verbHandler.handleVerb(verb);
            }
            catch(e){
                if(e instanceof VerbError){
                    this.emitCustomError(getVerbError(verb.type, e.message));
                }
            }

            if(nextGameState){
                this.syncGameState(nextGameState);
                if(acknowledgeFunction){
                    acknowledgeFunction(this.serializeGameState(nextGameState));
                }
            }

        });

        this.addEventListenerWithSocket(ETableClientEvents.JOIN_TABLE, (socket: SocketIO.Socket) => (acknowledgeFunction?: (clientInfo: TClientInfo, gameState: TSerializedGameState) => void) => {
            const { id } = socket;
            console.log(id, ' joined table');

            const nextGameState = this.tableHandler.joinTable(id);

            const {clientInfo} = extractClientById(nextGameState, id);
            const serializedGameState = this.serializeGameState(nextGameState);

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
        this.emit(ETableServerEvents.SYNC, this.serializeGameState(gameState));
    }, serverTick);

    private emitCustomError(error: TCustomError){
        this.emit(ETableServerEvents.CUSTOM_ERROR, error);
    }

    private serializeGameState(gameState: TGameState): TSerializedGameState {
        return {
            cards: [...gameState.cards.values()],
            clients: [...gameState.clients.values()].map(({clientInfo, status}) => ({
                clientInfo,
                status
            })),
            hands: [...gameState.hands.values()],
            decks: [...gameState.decks.values()],
        }
    }
}