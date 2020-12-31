export enum ETableClientEvents {
  // built in events
  CONNECT = "connect",
  DISCONNECT = "disconnect",

  JOIN_TABLE = "JOIN_TABLE",
  REJOIN_TABLE = "REJOIN_TABLE",
  VERB = "VERB",
  LEAVE_TABLE = "LEAVE_TABLE",
}

export enum ETableServerEvents {
  CONNECT = "connect",
  SYNC = "SYNC",
}

export enum EClientConnectionStatuses {
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
}
