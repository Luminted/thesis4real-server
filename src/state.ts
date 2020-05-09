import produce, { enableMapSet } from "immer";
import { GameState, Directions, PlayTable } from "./types/dataModelDefinitions";
import { serverConfig, ServerConfig } from "./config/serverConfig";
import { extractTableById } from "./extractors/serverStateExtractors";
 

// Enabling Map support for ImmerJs
enableMapSet();

//TODO: serverState should have getters instead of extractors
//TODO: think about making state gated to domains
export type ServerState = {
    directions: Directions[],
    tables: Map<string, PlayTable>,
    serverConfig: ServerConfig
}

export const initialServerState: ServerState = {
    tables: new Map<string, PlayTable>(),
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
        draft.tables.set(table.tableId, table);
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
        return serverState.tables.get(tableId).gameState;
    }
}