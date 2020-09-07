export enum TableClientEvents {
    //built in events
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    RECONNECT = 'reconnect',
    
    
    JOIN_TABLE = 'JOIN_TABLE',
    REJOIN_TABLE = 'REJOIN_TABLE',
    VERB = 'VERB',
    LEAVE_TABLE = 'LEAVE_TABLE',
    KICK_PLAYER = 'KICK_PLAYER',

    GET_TABLE_DIMENSIONS = 'GET_TABLE_DIMENSIONS'
}

export enum TableServerEvents {
    SYNC = 'SYNC',
}

export type JoinTablePayload = {
    clientId: string,
}

export type LeaveTablePayload = {
    
}

export enum ClientConnectionStatuses {
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
}
