import { SocketNamespace } from "../";
import { Singleton, Inject, Container } from "typescript-ioc";
import { handleGrab, handleRelease, handleRemove, handleMoveTo, handleMove } from './handlers/verbs/shared'
import { Verb, SharedVerbTypes, DeckVerbTypes, CardVerbTypes } from "../../types/verbTypes";
import { handleDrawFaceUp, handleReset } from "./handlers/verbs/deck";
import { handlePutInHand, handleGrabFromHand } from "./handlers/verbs/card";
import { TableStateStore } from "../../Store/TableStateStore/TableStateStore";
import { TableClientEvents, TableServerEvents, ClientConnectionStatuses } from "../../types/socketTypes";
import { serializeGameState } from "./utils";
import { GameState, ClientInfo, SerializedGameState, Seats, Client } from "../../types/dataModelDefinitions";
import { handleDisconnect } from "./handlers/disconnect/handleDisconnect";
import { handleJoinTable } from "./handlers/join-table/handleJoinTable";
import { extractClientById } from "../../extractors/gameStateExtractors";
 
@Singleton
export class TableNamespace extends SocketNamespace {

    @Inject
    tableStateStore: TableStateStore;

    constructor(){
        super();

        const {gameStateStore, tableWidth, tableHeight} = this.tableStateStore.state;

        this.addEventListener(TableClientEvents.VERB, (verb: Verb) => {
            gameStateStore.changeState(draft => {
                switch(verb.type){
                    case SharedVerbTypes.GRAB_FROM_TABLE:
                        return handleGrab(draft, verb);
                    case SharedVerbTypes.RELEASE:
                        return handleRelease(draft, verb);
                    case SharedVerbTypes.MOVE:
                        return handleMove(draft, verb, tableWidth, tableHeight);
                    case SharedVerbTypes.REMOVE:
                        return handleRemove(draft, verb);
                    case SharedVerbTypes.MOVE_TO:
                        return handleMoveTo(draft, verb);
                    case DeckVerbTypes.DRAW_FACE_UP:
                        return handleDrawFaceUp(draft, verb);
                    case DeckVerbTypes.RESET:
                        return handleReset(draft, verb);
                    case CardVerbTypes.PUT_IN_HAND:
                        return handlePutInHand(draft, verb);
                    case CardVerbTypes.GRAB_FROM_HAND:
                        return handleGrabFromHand(draft, verb);
                }
            })

            this.syncGameState(gameStateStore.state);
        });

        this.addEventListener(TableClientEvents.GET_TABLE_DIMENSIONS, (ackFunction?: (tableWidth: number, tableHeight: number) => void) => {
            if(typeof ackFunction === 'function'){
                ackFunction(tableWidth, tableHeight);
            }
        })

        this.addEventListenerWithSocket(TableClientEvents.JOIN_TABLE, (socket: SocketIO.Socket) => (acknowledgeFunction?: (clientInfo: ClientInfo, gameState: SerializedGameState) => void) => {
            const {id} = socket;
            console.log(id, ' joined table');

            gameStateStore.changeState(draft => handleJoinTable(draft, id));

            const {clientInfo} = extractClientById(gameStateStore.state, id);
            const serializedGameState = serializeGameState(gameStateStore.state);

            if(typeof acknowledgeFunction === 'function'){
                acknowledgeFunction(clientInfo, serializedGameState);
            }

            socket.broadcast.emit('sync', serializedGameState);
        })

        // TODO: type reason and handle cases
        this.addEventListenerWithSocket(TableClientEvents.DISCONNECT, (socket: SocketIO.Socket) => (reason: string) => {
            console.log('Disconnection reason: ', reason);
            
            gameStateStore.changeState(draft => {
                handleDisconnect(draft, socket.id);
            })
            this.syncGameState(gameStateStore.state);
        });
    }

    addClient(id: string, seatedAt: Seats, name?: string) {
        const {gameStateStore} = this.tableStateStore;
        const newClient: Client = {
            clientInfo: {
                clientId: id,
                seatedAt,
                clientName: name,
            },
            grabbedEntitiy: null,
            status: ClientConnectionStatuses.CONNECTED
        }
        gameStateStore.changeState(draft => {
            draft.clients.set(id, newClient);
        })

        return newClient;
    }

    private syncGameState(gameState: GameState){
        this.emit(TableServerEvents.SYNC, serializeGameState(gameState));
    }
}

Container.bind(TableNamespace);