import { Socket } from '../socket'
import { SocketListenerUsingSocket, PlainSocketListener, SocketEventHandler, SocketEventUsingSocket } from './typings';
import { Namespace } from 'socket.io';

export class SocketNamespace {
    public socket: Socket;
    public plainListeners: PlainSocketListener[] = [];
    public listenersUsingSocket: SocketListenerUsingSocket[] = [];
    public onConnect: (socket: SocketIO.Socket) => void | null = null;
    public nameSpace: Namespace;

    public init(route: string, socket: Socket) {
        const nameSpace = socket.addNamespace(route);

        nameSpace.on("connection", (socket: SocketIO.Socket) => {
            if(this.onConnect !== null){
                this.onConnect(socket);
            }
            this.plainListeners.forEach(({name, handler}) => socket.on(name, handler));
            this.listenersUsingSocket.forEach(({name, handler}) => socket.on(name, handler(socket)));

            console.log(socket.id, " connected");
        });

        this.nameSpace = nameSpace;

        console.log(`socket namespace ${route} initiated`);


    }

    public addEventListener(name: string, handler: SocketEventHandler) {
        this.plainListeners.push({
            name,
            handler
        })
    }

    public addEventListenerWithSocket(name: string, handler: SocketEventUsingSocket) {
        this.listenersUsingSocket.push({
            name,
            handler
        })
    }

    public emit(event: string, payload: any){
        this.nameSpace.emit(event, payload);
    }
    
}