import { GameState, Directions } from "./types/dataModelDefinitions";
import { gameConfig } from "./config";

export type ServerState = {
    gameState: GameState,
    directions: Directions[]
}

let serverState: ServerState;
initServerState();

function initServerState(){
    serverState = {
        gameState: {
            cards:[],
            decks: [],
            clients: [],
            hands: [],
            cardBoundary: null,
            deckBoundary: {
                top: 0,
                left: 0,
                right: 806,
                bottom: 443
            },
            ...gameConfig
        },
        directions: []
    }
}

export function getServerState(): ServerState {
    if(serverState === undefined){
        initServerState();
    }
    return serverState;
}

export function getGameState(): GameState {
    if(serverState === undefined) {
        initServerState();
    }
    return serverState.gameState;
}

export function setGameState(state: GameState): void {
    if(serverState === undefined){
        initServerState();
    }
    serverState.gameState = state;
}