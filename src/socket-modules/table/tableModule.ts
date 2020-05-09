import {getServerState, gameStateSetter, gameStateGetter } from "../../state";
import { extractTableById } from "../../extractors/serverStateExtractors";
import {TableModuleClientEvents, TableModuleServerEvents, JoinTablePayload} from '../../types/sockeTypes';
import { Verb } from "../../types/verbTypes";
import { handleVerb } from "../../handlers/verbs";
import { Directions, ClientInfo, GameState, SerializedGameState } from "../../types/dataModelDefinitions";
import { handleJoinTable } from "./handlers/join-table/handleJoinTable";
import { extractClientById } from "../../extractors/gameStateExtractors";
import { handleDisconnect } from "./handlers/disconnect/handleDisconnect";
import { serializeGameState } from "./utils";

export function TableModule(io: SocketIO.Server){
    const nspTable = io.of('/table');
    console.log('listening for connections ', nspTable.name);
    nspTable.on('connection', (socket) => {
        const tableId: string = socket.handshake.query.tableId;
        console.log('socket ' + socket.id + ' attempting connection to table: ' + tableId);
        const table = extractTableById(getServerState(), tableId);
        if(tableId && table){
            console.log('Socket ' + socket.id + ' connected to ' + tableId)
            const setGameState = gameStateSetter(tableId);
            const getGameState = gameStateGetter(tableId);

            //JOIN_TABLE
            socket.on(TableModuleClientEvents.JOIN_TABLE, (acknowledgeFunction: (clientInfo: ClientInfo, gameState: SerializedGameState) => void) => {
                socket.join(tableId);
                console.log(socket.id, ' joined table')
                const nextGameState = handleJoinTable(getGameState(), {socketId: socket.id});
                setGameState(nextGameState);
                const serializedGameState = serializeGameState(nextGameState)
                if(typeof acknowledgeFunction === 'function'){
                    const clientInfo = extractClientById(nextGameState, socket.id).clientInfo;
                    acknowledgeFunction(clientInfo, serializedGameState);
                }
                socket.to(tableId).broadcast.emit(TableModuleServerEvents.SYNC, serializedGameState);
            });
        
            //VERB
            socket.on(TableModuleClientEvents.VERB, (verb: Verb, ack: Function) => {
                try{
                    if(verb && tableId){
                        const nextState = handleVerb(getGameState(), verb);
                        setGameState(nextState);
                        nspTable.to(tableId).emit(TableModuleServerEvents.SYNC, serializeGameState(nextState));
                    }
                    if(ack){
                        ack();
                    }
                }catch(err){
                    console.log(err);
                }
            })

            socket.on(TableModuleClientEvents.DISCONNECT, (reason: string) => {
                console.log('Disconnection reason: ', reason)
                const nextState = handleDisconnect(getGameState(), socket.id);
                setGameState(nextState);
            })

        }
        else{
            console.log('No such table')
        }
    });

    return nspTable;
}