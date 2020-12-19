import SocketIO from "socket.io";
import { Inject, Singleton } from "typescript-ioc";
import { TableNamespace } from "../namespace";

@Singleton
export class Socket {
  public socket: SocketIO.Server;

  constructor(@Inject tableNameSpace: TableNamespace) {
    this.socket = SocketIO();

    tableNameSpace.init("table", this);
    console.log("Socket initiated");
  }

  public emit(name: string, ...args: any) {
    this.socket.emit(name, ...args);
  }

  public addNamespace(name: string) {
    return this.socket.of(name);
  }

  public listen(port: number) {
    console.log(`socket is listening on port ${port}`);
    this.socket.listen(port);
  }
}
