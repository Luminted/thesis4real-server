import {Socket} from 'socket.io';

export type PlainSocketListener = {
    name: string,
    handler: SocketEventHandler,
}

export type SocketListenerUsingSocket = {
    name: string,   
    handler: SocketEventUsingSocket,
}

export type SocketEventHandler = (...args: any[]) => void;
export type SocketEventUsingSocket = (socket: Socket) => (...args: any[]) => void;