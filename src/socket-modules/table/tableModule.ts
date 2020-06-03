import {getServerState, gameStateSetter, gameStateGetter, getTableById, setTableState, addSocketClientIdMapping, lookupClientId, removeSocketClientIdMapping} from "../../state";
import {TableModuleClientEvents, TableModuleServerEvents, JoinTablePayload} from '../../types/socketTypes';
import { Verb } from "../../types/verbTypes";
import { handleVerb } from "./handlers/verbs";
import { Seats, ClientInfo, GameState, SerializedGameState } from "../../types/dataModelDefinitions";
import { handleJoinTable } from "./handlers/join-table/handleJoinTable";
import { extractClientById } from "../../extractors/gameStateExtractors";
import { handleDisconnect } from "./handlers/disconnect/handleDisconnect";
import { serializeGameState } from "./utils";
import short from "short-uuid";
import { handleRejoinTable } from "./handlers/rejoin-table";
import { handleLeaveTable } from "./handlers/leave-table/handleLeaveTable";

export function TableModule(io: SocketIO.Server){
    const nspTable = io.of('/table');
console.log('listening for connections ', nspTable.name);

    //CONNECTION
    //TODO: input validation
    nspTable.on('connection', (socket) => {
        const tableId: string = socket.handshake.query.tableId;
        console.log('socket ' + socket.id + ' attempting connection to table: ' + tableId);
        const table = getTableById(tableId);
        if(tableId && table){
            console.log('Socket ' + socket.id + ' connected to ' + tableId)
            const setGameState = gameStateSetter(tableId);
            const getGameState = gameStateGetter(tableId);


            //GET_TABLE_INFO
            socket.on(TableModuleClientEvents.GET_TABLE_DIMENSIONS, (ackFunction?: (tableWidth: number, tableHeight: number) => void) => {
                if(typeof ackFunction ==='function'){
                    ackFunction(table.tableWidth, table.tableHeight);
                }
            })

            //JOIN_TABLE
            //this can be async
            socket.on(TableModuleClientEvents.JOIN_TABLE, (acknowledgeFunction?: (clientInfo: ClientInfo, gameState: SerializedGameState) => void) => {
                socket.join(tableId);
                console.log(socket.id, ' joined table');

                const clientId = short(short.constants.cookieBase90).new();
                const nextGameState = handleJoinTable(getGameState(), clientId);
                const serializedGameState = serializeGameState(nextGameState);
                const clientInfo = extractClientById(nextGameState, clientId).clientInfo;
                
                setGameState(nextGameState);
                addSocketClientIdMapping(tableId, clientId, socket.id);
                
                console.log(typeof acknowledgeFunction);
                if(typeof acknowledgeFunction === 'function'){
                    console.log('sending ack');
                    console.log(clientInfo)
                    acknowledgeFunction(clientInfo, serializedGameState);
                }
                socket.to(tableId).broadcast.emit(TableModuleServerEvents.SYNC, serializedGameState);
            });
        
            //VERB
            socket.on(TableModuleClientEvents.VERB, (verb: Verb, ack: Function) => {
                try{
                    if(verb && tableId){
                        const nextState = handleVerb(getGameState(), verb, tableId);
                        setGameState(nextState);
                        // console.log(serializeGameState(nextState).clients[0]?.grabbedEntitiy)
                        nspTable.to(tableId).emit(TableModuleServerEvents.SYNC, serializeGameState(nextState));
                    }
                    if(ack){
                        ack();
                    }
                }catch(err){
                    console.log(err);
                }
            })

            socket.on(TableModuleClientEvents.REJOIN_TABLE, (clientId: string, ackFunction: Function) => {
                const nextGameState = handleRejoinTable(getGameState(), clientId);

                setGameState(nextGameState);
                addSocketClientIdMapping(tableId, clientId, socket.id);

                if(typeof ackFunction === 'function'){
                    ackFunction();
                }
            })

            socket.on(TableModuleClientEvents.LEAVE_TABLE, (ackFunction: Function) => {
                const socketId = socket.id
                const {defaultPosition} = getTableById(tableId);
                const nextState = handleLeaveTable(getGameState(), lookupClientId(tableId, socketId), defaultPosition);
                
                setGameState(nextState);
                removeSocketClientIdMapping(tableId, socketId);

                if(typeof ackFunction === 'function'){
                    ackFunction();
                }
            })

            socket.on(TableModuleClientEvents.DISCONNECT, (reason: string) => {
                console.log('query ',socket.handshake.query.tableId);
                console.log('table id ', tableId);
                console.log('Disconnection reason: ', reason);
                const nextGameState = handleDisconnect(getGameState(), lookupClientId(tableId, socket.id));
                const serializedGameState = serializeGameState(nextGameState);
                
                setGameState(nextGameState);
                socket.to(tableId).broadcast.emit(TableModuleServerEvents.SYNC, serializedGameState);

            })

        }
        else{
            console.log('No such table')
        }
    });

    return nspTable;
}