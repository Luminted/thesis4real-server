import SocketIO from "socket.io";
import { Singleton, Inject } from "typescript-ioc";
import { TableNamespace } from "../namespace";

@Singleton
export class Socket {
  public socket: SocketIO.Server;

  constructor(@Inject tableNameSpace: TableNamespace) {
    this.socket = SocketIO();

    tableNameSpace.init("table", this);
    console.log("Socket initiated");
  }

  emit(name: string, ...args) {
    this.socket.emit(name, ...args);
  }

  addNamespace(name: string) {
    return this.socket.of(name);
  }

  listen(port: number) {
    console.log(`socket is listening on port ${port}`);
    this.socket.listen(port);
  }
}
