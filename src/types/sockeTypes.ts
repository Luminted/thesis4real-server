export enum TableModuleClientEvents {
    //built in events
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    RECONNECT = 'reconnect',
    
    
    JOIN_TABLE = 'JOIN_TABLE',
    VERB = 'VERB',
    KICK_PLAYER = 'KICK_PLAYER'
}

export enum TableModuleServerEvents {
    SYNC = 'SYNC'
}

export type JoinTablePayload = {
    socketId: string
}
