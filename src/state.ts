import produce, { enableMapSet } from "immer";
import { GameState, Seats, CardTable } from "./types/dataModelDefinitions";
import { serverConfig, ServerConfig } from "./config/serverConfig";
 

// Enabling Map support for ImmerJs
enableMapSet();

//TODO: serverState should have getters instead of extractors
//TODO: think about making state gated to domains
export type ServerState = {
    tables: Map<string, CardTable>,
    gameStates: Map<string, GameState>
    serverConfig: ServerConfig
}

//TODO: accessors for the mapping should be abstracted
export function addSocketClientIdMapping(tableId: string, clientId: string, socketId){
    serverState = produce(serverState, draft => {
        draft.tables.get(tableId).socketClientIdMapping[socketId] = clientId;
    })
}

export function lookupClientId(tableId: string, socketId: string){
    return getTableById(tableId).socketClientIdMapping[socketId];
}

export function removeSocketClientIdMapping(tableId: string, socketId: string){
    serverState = produce(serverState, draft => {
        draft.tables.get(tableId).socketClientIdMapping[socketId] = undefined;
    })
}


export const initialServerState: ServerState = {
    tables: new Map<string, CardTable>(),
    gameStates: new Map<string, GameState>(),
    serverConfig: serverConfig
}

let serverState: ServerState;
// initServerState();

export function initServerState(config?: ServerConfig){
    serverState = produce(initialServerState, () => {
        return {
            ...initialServerState,
            serverConfig: config || initialServerState.serverConfig
        }
    })
}

export function gameStateSetter(tableId: string){
    return function (nextState: GameState){
        serverState = produce(serverState, draft => {
            draft.gameStates.set(tableId, nextState);
        })
    }
}

export function getTableById(tableId: string){
    return serverState.tables.get(tableId);
}

export function setTableState(tableId: string, nextState: CardTable){
    serverState.tables.set(tableId, nextState);
}

export function getServerState(): ServerState {
    if(serverState === undefined){
        initServerState();
    }
    return serverState;
}

export function addTable(table: CardTable, gameState: GameState) {
    if(serverState === undefined){
        initServerState();
    }
    serverState = produce(serverState, draft => {
        const {tableId} = table;
        draft.tables.set(tableId, table);
        draft.gameStates.set(tableId, gameState);
    })
}

export function removeTable(tableId: string) {
    if(serverState === undefined){
        initServerState();
    }
    serverState = produce(serverState, draft => {
        draft.tables.delete(tableId);
    })
}

export function gameStateGetter(tableId: string) {
    return function() {
        if(serverState === undefined) {
            initServerState();
        }
        //TODO: handle undefined
        return serverState.gameStates.get(tableId);
    }
}