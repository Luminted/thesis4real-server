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
import { uuid } from "short-uuid";
 
@Singleton
export class TableNamespace extends SocketNamespace {

    @Inject
    private verbHandler: VerbHandler;
    @Inject
    private tableHandler: TableHandler;
    @Inject
    private connectionHandler: ConnectionHandler;
    @Inject
    private gameStateStore: GameStateStore;

    constructor(){
        super();

        this.onConnect = (socket) =>{
            const { clientId } = socket.handshake.query;
            const customId = uuid();

            try{
                this.connectionHandler.connect(clientId);
                socket.id = clientId ? clientId : customId;
            }
            catch(e){
                console.error(e.message);
                socket.emit(ETableServerEvents.CUSTOM_ERROR, `Reconnection failed. Reason: ${e.message}`);
            }

            socket.emit(ETableServerEvents.SYNC, this.serializeGameState(this.gameStateStore.state));
        }

        this.addEventListenerWithSocket(ETableClientEvents.VERB, socket => 
            (verb: TVerb, acknowledgeFunction?: Function) => {
                let nextGameState: TGameState;
                try{
                    nextGameState = this.verbHandler.handleVerb(verb);
                }
                catch(e){
                    if(e instanceof VerbError){
                        socket.emit(ETableServerEvents.CUSTOM_ERROR, (getVerbError(verb.type, e.message)));
                    }
                }

                if(nextGameState){
                    this.syncGameState(nextGameState);
                    if(acknowledgeFunction){
                        acknowledgeFunction(this.serializeGameState(nextGameState));
                    }
                }

        });

        this.addEventListenerWithSocket(ETableClientEvents.JOIN_TABLE, socket =>
            (requestedSeatId: string, acknowledgeFunction?: (clientInfo: TClientInfo, gameState: TSerializedGameState) => void) => {
                const {id} = socket;
                
                try{
                    this.tableHandler.joinTable(requestedSeatId, id);
                    const gameState = this.gameStateStore.state;
                    const {clientInfo} = extractClientById(gameState, id);

                    if(typeof acknowledgeFunction === 'function'){
                        const serializedGameState = this.serializeGameState(gameState);
                        acknowledgeFunction(clientInfo, serializedGameState);
                    }
                    
                    this.syncGameState(gameState);
                }
                catch(e){
                    console.log(e.message);
                }
                
                console.log(id, ' joined table');
        })

        this.addEventListenerWithSocket(ETableClientEvents.DISCONNECT, socket => (reason: string) => {
            const {id}  = socket;
            
            const nextGameState = this.connectionHandler.disconnect(id);
            
            this.syncGameState(nextGameState);
            console.log(`disconnection reason: ${reason}`);
        })
    }

    private syncGameState = throttle((gameState: TGameState) => {
        this.emit(ETableServerEvents.SYNC, this.serializeGameState(gameState));
    }, serverTick);

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