import { Namespace } from "socket.io";
import { Socket } from "../socket";
import { TPlainSocketListener, TSocketEventHandler, TSocketEventUsingSocket, TSocketListenerUsingSocket } from "./typings";

export class SocketNamespace {
  public plainListeners: TPlainSocketListener[] = [];
  public listenersUsingSocket: TSocketListenerUsingSocket[] = [];
  public onConnect: (socket: SocketIO.Socket) => void | null = null;
  public nameSpace: Namespace;

  public init(route: string, socket: Socket) {
    const nameSpace = socket.addNamespace(route);

    nameSpace.on("connection", (clientSocket: SocketIO.Socket) => {
      if (this.onConnect !== null) {
        this.onConnect(clientSocket);
      }
      this.plainListeners.forEach(({ name, handler }) => clientSocket.on(name, handler));
      this.listenersUsingSocket.forEach(({ name, handler }) => clientSocket.on(name, handler(clientSocket)));

      console.log(clientSocket.id, " connected");
    });

    this.nameSpace = nameSpace;

    console.log(`socket namespace ${route} initiated`);
  }

  public addEventListener(name: string, handler: TSocketEventHandler) {
    this.plainListeners.push({
      name,
      handler,
    });
  }

  public addEventListenerWithSocket(name: string, handler: TSocketEventUsingSocket) {
    this.listenersUsingSocket.push({
      name,
      handler,
    });
  }

  public emit(event: string, payload: any) {
    this.nameSpace.emit(event, payload);
  }
}
