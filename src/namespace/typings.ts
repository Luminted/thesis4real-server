import { Socket } from "socket.io";

export type TPlainSocketListener = {
  name: string;
  handler: TSocketEventHandler;
};

export type TSocketListenerUsingSocket = {
  name: string;
  handler: TSocketEventUsingSocket;
};

export type TSocketEventHandler = (...args: any[]) => void;
export type TSocketEventUsingSocket = (
  socket: Socket
) => (...args: any[]) => void;
