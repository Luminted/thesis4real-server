import produce from "immer";
import { GameState, Directions, PlayTable } from "./types/dataModelDefinitions";
import { serverConfig, ServerConfig } from "./config/serverConfig";
import { extractTableById } from "./extractors/serverStateExtractors";

//TODO: serverState should have getters instead of extractors
//TODO: think about making state gated to domains
export type ServerState = {
    directions: Directions[],
    tables: PlayTable[],
    serverConfig: ServerConfig
}

const initialServerState: ServerState = {
    tables: [],
    directions: [],
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
            const table = extractTableById(draft, tableId);
            table.gameState = nextState;
        })
    }
}

export function getServerState(): ServerState {
    if(serverState === undefined){
        initServerState();
    }
    return serverState;
}

export function addTable(table: PlayTable) {
    if(serverState === undefined){
        initServerState();
    }
    serverState = produce(serverState, draft => {
        draft.tables.push(table);
    })
}

export function removeTable(tableId: string) {
    if(serverState === undefined){
        initServerState();
    }
    serverState = produce(serverState, draft => {
        draft.tables = serverState.tables.filter(table => table.tableId !== tableId);
    })
}

export function gameStateGetter(tableId: string) {
    return function() {
        if(serverState === undefined) {
            initServerState();
        }
        //TODO: handle undefined
        return serverState.tables.find(table => table.tableId === tableId).gameState;
    }
}