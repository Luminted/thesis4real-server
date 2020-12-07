import throttle from "lodash.throttle";
import { SocketNamespace } from "..";
import { Singleton, Inject } from "typescript-ioc";
import { ETableClientEvents, ETableServerEvents, TVerb, TGameState, TClientInfo, TSerializedGameState } from "../../typings";
import { TableHandler, VerbHandler } from "../../stateHandlers";
import { ConnectionHandler } from "../../stateHandlers/Connection/ConnectionHandler";
import { GameStateStore } from "../../stores/GameStateStore";
import { serverTick } from "../../config";
import {getVerbErrorMessage} from "../../utils";
import { TableStateStore } from "../../stores/TableStateStore";
 
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
    @Inject
    private tableStateStore: TableStateStore;

    constructor(){
        super();

        this.onConnect = (socket) =>{
            socket.emit(ETableServerEvents.SYNC, this.serializeGameState(this.gameStateStore.state));
        }

        this.addEventListener(ETableClientEvents.REJOIN_TABLE, (clientId: string, ackFunction?: (error: string) => void) => {
                let error;

                try{
                    this.tableHandler.rejoin(clientId);
                    this.syncGameState(this.gameStateStore.state);
                }
                catch(e){
                    error = e.message;
                }

                if(typeof ackFunction === 'function'){
                    ackFunction(error);
                }
            })

        this.addEventListener(ETableClientEvents.VERB, (verb: TVerb, acknowledgeFunction?: (error: string, gameState: TSerializedGameState) => void) => {
                let error: string;

                try{
                   this.verbHandler.handleVerb(verb);
                   this.syncGameState(this.gameStateStore.state);
                }
                catch(e){
                    error = getVerbErrorMessage(verb.type, e.message);
                }

                if(typeof acknowledgeFunction === 'function'){
                    acknowledgeFunction(error, this.serializeGameState(this.gameStateStore.state));
                }
        });

        this.addEventListenerWithSocket(ETableClientEvents.JOIN_TABLE, socket =>
            (requestedSeatId: string, acknowledgeFunction?: (error: string, clientInfo: TClientInfo) => void) => {
                const {id} = socket;
                let error: string;
                let newClientInfo: TClientInfo;
                
                try{
                    this.tableHandler.joinTable(requestedSeatId, id);
                    const newClientId = this.tableStateStore.state.socketIdMapping[id];
                    newClientInfo = this.gameStateStore.state.clients.get(newClientId).clientInfo;
                    this.syncGameState(this.gameStateStore.state);
                }
                catch(e){
                    console.log(e.message);
                    error = e.message;
                }
                
                if(typeof acknowledgeFunction === "function"){
                    acknowledgeFunction(error, newClientInfo);
                }
        })

        this.addEventListener(ETableClientEvents.LEAVE_TABLE, (clientId: string, ackFunction?: (error:string) => void) => {
                let error;

                try{
                    this.tableHandler.leaveTable(clientId);
                    this.syncGameState(this.gameStateStore.state);
                }
                catch(e){
                    error = e.message;
                }

                if(typeof ackFunction === "function"){
                    ackFunction(error);
                }
            })

        this.addEventListenerWithSocket(ETableClientEvents.DISCONNECT, socket => (reason: string) => {
            const {id}  = socket;
            
            try{
                this.connectionHandler.disconnect(id);
                this.syncGameState(this.gameStateStore.state);
            }
            catch(e){
                console.log(e.message)
            }
            
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