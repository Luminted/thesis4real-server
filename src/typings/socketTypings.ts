export enum ETableClientEvents {
  // built in events
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  RECONNECT = "reconnect",

  JOIN_TABLE = "JOIN_TABLE",
  REJOIN_TABLE = "REJOIN_TABLE",
  VERB = "VERB",
  LEAVE_TABLE = "LEAVE_TABLE",
}

export enum ETableServerEvents {
  SYNC = "SYNC",
}

export enum EClientConnectionStatuses {
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
}
